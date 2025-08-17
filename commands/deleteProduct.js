const { loadProducts, saveProducts, loadConfig } = require('../utils/jsonHandler');

module.exports = async function deleteProduct(interaction){
    const products = loadProducts();

    if(products.length === 0) return interaction.reply({ content: '🚫 لا يوجد منتجات للحذف', ephemeral: true });

    const options = products.map(p => ({ label: p.name, value: p.id.toString() })).slice(0, 25);
    const row = new require('discord.js').ActionRowBuilder()
        .addComponents(
            new require('discord.js').StringSelectMenuBuilder()
                .setCustomId('delete_product_select')
                .setPlaceholder('اختر المنتج للحذف')
                .addOptions(options)
        );

    interaction.reply({ content: 'اختر المنتج للحذف:', components: [row], ephemeral: true });

    // بعد اختيار المنتج، احذف الرسالة من قناة المتجر
};