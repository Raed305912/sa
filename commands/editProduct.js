const { loadProducts, saveProducts, loadConfig } = require('../utils/jsonHandler');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function editProduct(interaction, client){
    const products = loadProducts();

    if(products.length === 0) return interaction.reply({ content: '🚫 لا يوجد منتجات للتعديل', ephemeral: true });

    const options = products.map(p => ({ label: p.name, value: p.id.toString() })).slice(0, 25);

    const row = new ActionRowBuilder()
        .addComponents(
            new require('discord.js').StringSelectMenuBuilder()
                .setCustomId('edit_product_select')
                .setPlaceholder('اختر المنتج للتعديل')
                .addOptions(options)
        );

    interaction.reply({ content: 'اختر المنتج لتعديله:', components: [row], ephemeral: true });

    // Listener لتحديث البيانات بعد الاختيار يمكن إضافته في index.js
};