const { loadProducts, saveProducts, loadConfig } = require('../utils/jsonHandler');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = async function addProduct(interaction, client){
    const STORE_CHANNEL_ID = loadConfig().STORE_CHANNEL_ID;
    if(!STORE_CHANNEL_ID) return interaction.reply({ content: '🚫 لم يتم تعيين قناة المتجر.', ephemeral: true });

    const filter = m => m.author.id === interaction.user.id;
    const channel = interaction.channel;

    await interaction.reply({ content: '📷 أرسل 1 إلى 3 صور للمنتج الآن:', ephemeral: true });

    const collectedImages = [];
    const collector = channel.createMessageCollector({ filter, time: 60000, max: 3 });

    collector.on('collect', m => {
        if(m.attachments.size > 0){
            collectedImages.push(...m.attachments.map(a => a.url));
        }
    });

    collector.on('end', async () => {
        if(collectedImages.length === 0) return interaction.followUp({ content: '🚫 لم ترسل أي صور.', ephemeral: true });

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_images')
                .setLabel('✅ تأكيد الصور')
                .setStyle(ButtonStyle.Success)
        );

        const msg = await interaction.followUp({ content: `📸 تم استلام ${collectedImages.length} صور. اضغط لتأكيد`, components: [confirmRow], ephemeral: true });

        const buttonFilter = i => i.user.id === interaction.user.id && i.customId === 'confirm_images';
        const collectorBtn = msg.createMessageComponentCollector({ filter: buttonFilter, time: 30000 });

        collectorBtn.on('collect', async i => {
            await i.update({ content: '✅ الصور مؤكدة! الآن ارسل اسم المنتج:', components: [] });

            const nameCollector = channel.createMessageCollector({ filter, max: 1, time: 60000 });
            nameCollector.on('collect', async nameMsg => {
                const name = nameMsg.content;

                await channel.send('✏️ الآن أرسل وصف المنتج:');
                const descCollector = channel.createMessageCollector({ filter, max: 1, time: 60000 });
                descCollector.on('collect', async descMsg => {
                    const desc = descMsg.content;

                    await channel.send('💰 الآن أرسل سعر المنتج:');
                    const priceCollector = channel.createMessageCollector({ filter, max: 1, time: 60000 });
                    priceCollector.on('collect', async priceMsg => {
                        const price = priceMsg.content;

                        const products = loadProducts();
                        const product = { id: Date.now(), name, desc, price, images: collectedImages, author: interaction.user.id };
                        products.push(product);
                        saveProducts(products);

                        const embed = new EmbedBuilder()
                            .setTitle(name)
                            .setDescription(desc + `\n💰 السعر: ${price}`)
                            .setColor('Green')
                            .setImage(collectedImages[0]);

                        const storeChannel = client.channels.cache.get(STORE_CHANNEL_ID);
                        if(storeChannel) storeChannel.send({ embeds: [embed] });

                        await channel.send('✅ تم إضافة المنتج بنجاح!');
                    });
                });
            });
        });
    });
};