const { loadProducts, saveProducts } = require('../utils/jsonHandler');
const logEvent = require('./logEvent');
const { EmbedBuilder } = require('discord.js');

module.exports = async function editProduct(interaction, client) {
    const products = loadProducts();
    if(products.length === 0) return interaction.reply({ content: '🚫 لا توجد منتجات.', ephemeral: true });

    let options = products.map(p => ({ label: p.name, value: p.id }));
    const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('edit_product_select')
            .setPlaceholder('اختر المنتج للتعديل')
            .addOptions(options)
    );

    await interaction.reply({ content: 'اختر المنتج للتعديل:', components: [menu], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id && i.customId === 'edit_product_select';
    const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async i => {
        const product = products.find(p => p.id === i.values[0]);
        if(!product) return i.reply({ content: '🚫 المنتج غير موجود', ephemeral: true });

        const msgFilter = m => m.author.id === interaction.user.id;
        await i.reply('✏️ ارسل الاسم الجديد للمنتج:');
        const nameMsg = await interaction.channel.awaitMessages({ filter: msgFilter, max: 1, time: 30000 });
        const newName = nameMsg.first().content;

        await interaction.followUp('📝 ارسل الوصف الجديد:');
        const descMsg = await interaction.channel.awaitMessages({ filter: msgFilter, max: 1, time: 30000 });
        const newDesc = descMsg.first().content;

        await interaction.followUp('💰 ارسل السعر الجديد:');
        const priceMsg = await interaction.channel.awaitMessages({ filter: msgFilter, max: 1, time: 30000 });
        const newPrice = priceMsg.first().content;

        // تعديل الرسالة الأصلية
        try {
            const config = require('../utils/jsonHandler').loadConfig();
            const channel = await client.channels.fetch(config.STORE_CHANNEL_ID);
            const msg = await channel.messages.fetch(product.messageId);
            const embed = new EmbedBuilder()
                .setTitle(newName)
                .setDescription(newDesc)
                .setFooter({ text: `السعر: ${newPrice}` })
                .setImage(product.images[0]);
            await msg.edit({ embeds: [embed] });
        } catch(err){}

        product.name = newName;
        product.description = newDesc;
        product.price = newPrice;
        saveProducts(products);

        logEvent(client, 'تعديل منتج', `تم تعديل المنتج: ${newName} بواسطة ${interaction.user.tag}`);
        i.followUp({ content: '✅ تم تعديل المنتج بنجاح!', ephemeral: true });
    });
};