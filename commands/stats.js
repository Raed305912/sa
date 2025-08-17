const { EmbedBuilder } = require('discord.js');
const { loadProducts, loadAdmins } = require('../utils/jsonHandler');

module.exports = async function stats(interaction, client){
    const products = loadProducts();
    const admins = loadAdmins();

    const embed = new EmbedBuilder()
        .setTitle('📊 إحصائيات المتجر')
        .setDescription(`عدد المنتجات: **${products.length}**\nعدد الأدمن: **${admins.admins.length}**\nعدد السوبر أدمن: **${admins.superAdmins.length}**`)
        .setColor('Blue');

    if(products.length > 0){
        const lastProduct = products[products.length-1];
        embed.addFields({ name: 'آخر منتج مضاف', value: `${lastProduct.name}` });
    }

    interaction.reply({ embeds: [embed], ephemeral: true });
};