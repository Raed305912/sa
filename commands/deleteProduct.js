const { loadProducts, saveProducts } = require('../utils/jsonHandler');
const logEvent = require('./logEvent');

module.exports = async function deleteProduct(interaction, client) {
    const products = loadProducts();
    if(products.length === 0) return interaction.reply({ content: '🚫 لا توجد منتجات.', ephemeral: true });

    let options = products.map(p => ({ label: p.name, value: p.id }));
    const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('delete_product_select')
            .setPlaceholder('اختر المنتج للحذف')
            .addOptions(options)
    );

    await interaction.reply({ content: 'اختر المنتج للحذف:', components: [menu], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id && i.customId === 'delete_product_select';
    const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async i => {
        const product = products.find(p => p.id === i.values[0]);
        if(!product) return i.reply({ content: '🚫 المنتج غير موجود', ephemeral: true });

        // حذف رسالة المنتج الأصلية
        try {
            const config = require('../utils/jsonHandler').loadConfig();
            const channel = await client.channels.fetch(config.STORE_CHANNEL_ID);
            const msg = await channel.messages.fetch(product.messageId);
            await msg.delete();
        } catch(err){}

        const index = products.indexOf(product);
        products.splice(index, 1);
        saveProducts(products);

        logEvent(client, 'حذف منتج', `تم حذف المنتج: ${product.name} بواسطة ${interaction.user.tag}`);
        i.reply({ content: '✅ تم حذف المنتج بنجاح!', ephemeral: true });
    });
};