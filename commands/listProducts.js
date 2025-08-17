const { loadProducts } = require('../utils/jsonHandler');
const { EmbedBuilder } = require('discord.js');

module.exports = async function listProducts(interaction, client, search){
    let products = loadProducts();
    if(search) products = products.filter(p => p.name.includes(search));

    if(products.length === 0) return interaction.reply({ content: '🚫 لا يوجد منتجات لعرضها.', ephemeral: true });

    const embed = new EmbedBuilder()
        .setTitle('📦 قائمة المنتجات')
        .setColor('Blue');

    let description = '';
    products.forEach((p, idx) => {
        description += `**${idx+1}. ${p.name}** - 💰 ${p.price}\n`;
    });

    embed.setDescription(description);
    interaction.reply({ embeds: [embed], ephemeral: true });
};