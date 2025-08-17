const { loadProducts, saveProducts } = require('../utils/jsonHandler');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = async function deleteProduct(interaction, client){
    const products = loadProducts();
    if(products.length === 0) return interaction.reply({ content: '🚫 لا يوجد منتجات للحذف.', ephemeral: true });

    const options = products.map(p => ({ label: p.name, value: p.id.toString() }));
    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('select_delete_product')
            .setPlaceholder('اختر المنتج للحذف')
            .addOptions(options)
    );

    await interaction.reply({ content: '🗑️ اختر المنتج للحذف:', components: [row], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id && i.customId === 'select_delete_product';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', i => {
        const productId = i.values[0];
        const index = products.findIndex(p => p.id.toString() === productId);
        if(index === -1) return i.update({ content: '🚫 لم يتم العثور على المنتج.', components: [] });

        const removed = products.splice(index, 1)[0];
        saveProducts(products);

        i.update({ content: `✅ تم حذف المنتج: **${removed.name}**`, components: [] });
    });
};