const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadProducts } = require('../utils/jsonHandler');

module.exports = async function listProducts(interaction) {
    const products = loadProducts();
    if(products.length === 0) return interaction.reply({ content: '🚫 لا يوجد منتجات.', ephemeral: true });

    let page = 0;
    const perPage = 5;
    const totalPages = Math.ceil(products.length / perPage);

    const generateEmbed = () => {
        const embed = new EmbedBuilder()
            .setTitle('📦 قائمة المنتجات')
            .setDescription(products.slice(page*perPage, page*perPage + perPage).map((p,i) => `${i+1 + page*perPage}. **${p.name}** - ${p.price}\n${p.description}`).join('\n\n'))
            .setFooter({ text: `صفحة ${page+1}/${totalPages}` });
        return embed;
    };

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('◀️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('next').setLabel('▶️').setStyle(ButtonStyle.Primary)
        );

    const msg = await interaction.reply({ embeds: [generateEmbed()], components: [row], fetchReply: true });

    const filter = i => i.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', i => {
        if(i.customId === 'next') page = (page + 1) % totalPages;
        if(i.customId === 'prev') page = (page - 1 + totalPages) % totalPages;
        i.update({ embeds: [generateEmbed()] });
    });
};