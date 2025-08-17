const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { loadProducts, saveProducts } = require('../utils/jsonHandler');

module.exports = async function addProduct(interaction) {
    if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: '🚫 ليس لديك صلاحية.', ephemeral: true });

    const filter = m => m.author.id === interaction.user.id;
    const channel = interaction.channel;

    // طلب الصور
    await channel.send('📸 أرسل صور المنتج (1-3 صور)، كل صورة في رسالة منفصلة. ارسل "تم" عند الانتهاء.');
    const images = [];
    const collector = channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', m => {
        if(m.content.toLowerCase() === 'تم') {
            collector.stop();
        } else if(m.attachments.size > 0) {
            images.push(m.attachments.first().url);
            m.react('✅');
        } else {
            m.react('❌');
        }
    });

    collector.on('end', async () => {
        if(images.length === 0) return channel.send('🚫 لم يتم إضافة أي صور.');

        await channel.send('✏️ ارسل اسم المنتج:');
        const nameCollector = channel.createMessageCollector({ filter, max: 1, time: 30000 });
        nameCollector.on('collect', async nameMsg => {
            const name = nameMsg.content;

            await channel.send('📝 ارسل وصف المنتج:');
            const descCollector = channel.createMessageCollector({ filter, max: 1, time: 30000 });
            descCollector.on('collect', async descMsg => {
                const description = descMsg.content;

                await channel.send('💰 ارسل سعر المنتج:');
                const priceCollector = channel.createMessageCollector({ filter, max: 1, time: 30000 });
                priceCollector.on('collect', async priceMsg => {
                    const price = priceMsg.content;

                    const products = loadProducts();
                    products.push({ id: Date.now().toString(), owner: interaction.user.id, images, name, description, price });
                    saveProducts(products);

                    const embed = new EmbedBuilder()
                        .setTitle(name)
                        .setDescription(description)
                        .setFooter({ text: `السعر: ${price}` });
                    images.forEach(img => embed.setImage(img));

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel('تواصل مع البائع')
                                .setStyle(ButtonStyle.Link)
                                .setURL('https://discord.com/users/' + interaction.user.id)
                        );

                    await channel.send({ embeds: [embed], components: [row] });
                    channel.send('✅ تم إضافة المنتج بنجاح!');
                });
            });
        });
    });
};