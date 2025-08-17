const { loadProducts, saveProducts, loadConfig } = require('../utils/jsonHandler');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = async function editProduct(interaction, client){
    const products = loadProducts();
    if(products.length === 0) return interaction.reply({ content: '🚫 لا يوجد منتجات للتعديل.', ephemeral: true });

    const options = products.map(p => ({ label: p.name, value: p.id.toString() }));
    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('select_edit_product')
            .setPlaceholder('اختر المنتج للتعديل')
            .addOptions(options)
    );

    await interaction.reply({ content: '✏️ اختر المنتج لتعديله:', components: [row], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id && i.customId === 'select_edit_product';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async i => {
        const productId = i.values[0];
        const product = products.find(p => p.id.toString() === productId);
        if(!product) return i.update({ content: '🚫 لم يتم العثور على المنتج.', components: [] });

        await i.update({ content: `✏️ أرسل الاسم الجديد للمنتج (**${product.name}**) أو ضع "-" لتبقي كما هو:`, components: [] });

        const msgFilter = m => m.author.id === interaction.user.id;
        const nameCollector = interaction.channel.createMessageCollector({ filter: msgFilter, max: 1, time: 60000 });
        nameCollector.on('collect', msg => {
            if(msg.content !== '-') product.name = msg.content;

            interaction.channel.send('✏️ أرسل الوصف الجديد أو ضع "-" لتبقي كما هو:');
            const descCollector = interaction.channel.createMessageCollector({ filter: msgFilter, max: 1, time: 60000 });
            descCollector.on('collect', msg2 => {
                if(msg2.content !== '-') product.desc = msg2.content;

                interaction.channel.send('💰 أرسل السعر الجديد أو ضع "-" لتبقي كما هو:');
                const priceCollector = interaction.channel.createMessageCollector({ filter: msgFilter, max: 1, time: 60000 });
                priceCollector.on('collect', msg3 => {
                    if(msg3.content !== '-') product.price = msg3.content;

                    saveProducts(products);

                    const STORE_CHANNEL_ID = loadConfig().STORE_CHANNEL_ID;
                    const storeChannel = client.channels.cache.get(STORE_CHANNEL_ID);
                    if(storeChannel){
                        const embed = new EmbedBuilder()
                            .setTitle(product.name)
                            .setDescription(`${product.desc}\n💰 السعر: ${product.price}`)
                            .setColor('Green')
                            .setImage(product.images[0]);

                        storeChannel.send({ embeds: [embed] });
                    }

                    interaction.channel.send('✅ تم تعديل المنتج بنجاح!');
                });
            });
        });
    });
};