const { loadProducts } = require('../utils/jsonHandler');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function listProducts(interaction, client, isAdminView){
    const products = loadProducts();
    if(products.length === 0) return interaction.reply({ content: '🚫 لا يوجد منتجات حالياً', ephemeral: true });

    // عرض أول منتج كبدء
    const product = products[0];
    const embed = new EmbedBuilder()
        .setTitle(product.name)
        .setDescription(`${product.desc}\n💰 السعر: ${product.price}`)
        .setImage(product.images[0]);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId(`prev_${product.id}_0`).setLabel('◀️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`next_${product.id}_0`).setLabel('▶️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setLabel('تواصل مع البائع').setStyle(ButtonStyle.Link).setURL(`https://discord.com/users/${process.env.DEVELOPER_ID}`)
        );

    interaction.reply({ embeds: [embed], components: [row] });
};