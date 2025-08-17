const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { loadProducts, saveProducts } = require('../utils/jsonHandler');

module.exports = async function deleteProduct(interaction) {
    if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: '🚫 ليس لديك صلاحية.', ephemeral: true });

    const products = loadProducts();
    if(products.length === 0) return interaction.reply({ content: '🚫 لا يوجد منتجات.', ephemeral: true });

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('delete_select')
            .setPlaceholder('اختر المنتج للحذف')
            .addOptions(products.map(p => ({ label: p.name, value: p.id })))
    );

    await interaction.reply({ content: 'اختر المنتج للحذف:', components: [menu], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id && i.customId === 'delete_select';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', i => {
        const index = products.findIndex(p => p.id === i.values[0]);
        if(index !== -1) {
            products.splice(index, 1);
            saveProducts(products);
            i.reply({ content: '✅ تم حذف المنتج بنجاح!', ephemeral: true });
        } else {
            i.reply({ content: '❌ خطأ', ephemeral: true });
        }
    });
};