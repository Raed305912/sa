const { loadProducts } = require('../utils/jsonHandler');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function listProducts(interaction, client) {
    const products = loadProducts();
    if(products.length === 0) return interaction.reply({ content: '🚫 لا توجد منتجات.', ephemeral: true });

    let currentPage = 0;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const generateEmbed = page => {
        const start = page * itemsPerPage;
        const currentItems = products.slice(start, start + itemsPerPage);

        const embed = new EmbedBuilder()
            .setTitle(`📦 قائمة المنتجات (صفحة ${page+1}/${totalPages})`)
            .setDescription(currentItems.map(p => `**${p.name}** - ${p.price}`).join('\n'));
        return embed;
    };

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('⬅️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Primary)
    );

    const message = await interaction.reply({ embeds: [generateEmbed(currentPage)], components: [row], fetchReply: true });

    const filter = i => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', i => {
        if(i.customId === 'next') {
            if(currentPage < totalPages -1) currentPage++;
        } else if(i.customId === 'prev') {
            if(currentPage > 0) currentPage--;
        }
        i.update({ embeds: [generateEmbed(currentPage)], components: [row] });
    });
};