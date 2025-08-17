const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { loadProducts, saveProducts } = require('../utils/jsonHandler');
const logEvent = require('./logEvent');

module.exports = async function addProduct(interaction, client) {
    if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: '🚫 ليس لديك صلاحية.', ephemeral: true });

    const config = require('../utils/jsonHandler').loadConfig();
    const channel = await client.channels.fetch(config.STORE_CHANNEL_ID);
    if(!channel) return interaction.reply({ content: '❌ قناة المتجر غير موجودة', ephemeral: true });

    const filter = m => m.author.id === interaction.user.id;
    await interaction.reply({ content: '📸 أرسل صور المنتج (1-3 صور)، كل صورة برسالة منفصلة، ثم ارسل "تم".', ephemeral: true });

    const images = [];
    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });
    collector.on('collect', m => {
        if(m.content.toLowerCase() === 'تم') collector.stop();
        else if(m.attachments.size > 0) images.push(m.attachments.first().url);
    });

    collector.on('end', async () => {
        if(images.length === 0) return interaction.followUp('🚫 لم يتم إضافة أي صور.');

        await interaction.followUp('✏️ ارسل اسم المنتج:');
        const nameMsg = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 });
        const name = nameMsg.first().content;

        await interaction.followUp('📝 ارسل وصف المنتج:');
        const descMsg = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 });
        const description = descMsg.first().content;

        await interaction.followUp('💰 ارسل سعر المنتج:');
        const priceMsg = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 });
        const price = priceMsg.first().content;

        const embed = new EmbedBuilder()
            .setTitle(name)
            .setDescription(description)
            .setFooter({ text: `السعر: ${price}` });
        embed.setImage(images[0]); // أول صورة كصورة رئيسية

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('تواصل مع البائع')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/users/${interaction.user.id}`)
            );

        const msg = await channel.send({ embeds: [embed], components: [row] });

        const products = loadProducts();
        products.push({ id: Date.now().toString(), owner: interaction.user.id, images, name, description, price, messageId: msg.id });
        saveProducts(products);

        logEvent(client, 'إضافة منتج', `تم إضافة المنتج: ${name} بواسطة ${interaction.user.tag}`);
        interaction.followUp('✅ تم إضافة المنتج بنجاح!');
    });
};