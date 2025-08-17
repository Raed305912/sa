const { ActionRowBuilder, StringSelectMenuBuilder, MessageCollector } = require('discord.js');
const { loadProducts, saveProducts } = require('../utils/jsonHandler');

module.exports = async function editProduct(interaction) {
    if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: '🚫 ليس لديك صلاحية.', ephemeral: true });

    const products = loadProducts();
    if(products.length === 0) return interaction.reply({ content: '🚫 لا يوجد منتجات.', ephemeral: true });

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('edit_select')
            .setPlaceholder('اختر المنتج للتعديل')
            .addOptions(products.map(p => ({ label: p.name, value: p.id })))
    );

    await interaction.reply({ content: 'اختر المنتج:', components: [menu], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id && i.customId === 'edit_select';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        const product = products.find(p => p.id === i.values[0]);
        if(!product) return i.reply({ content: '❌ خطأ', ephemeral: true });

        await i.reply({ content: '✏️ ارسل الاسم الجديد أو "نفسه" للاحتفاظ بالاسم:', ephemeral: true });
        const nameCollector = new MessageCollector(interaction.channel, { filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
        nameCollector.on('collect', mName => {
            if(mName.content.toLowerCase() !== 'نفسه') product.name = mName.content;
            mName.delete();

            interaction.channel.send('📝 ارسل الوصف الجديد أو "نفسه":').then(() => {
                const descCollector = new MessageCollector(interaction.channel, { filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                descCollector.on('collect', mDesc => {
                    if(mDesc.content.toLowerCase() !== 'نفسه') product.description = mDesc.content;
                    mDesc.delete();

                    interaction.channel.send('💰 ارسل السعر الجديد أو "نفسه":').then(() => {
                        const priceCollector = new MessageCollector(interaction.channel, { filter: m => m.author.id === interaction.user.id, max: 1, time: 30000 });
                        priceCollector.on('collect', mPrice => {
                            if(mPrice.content.toLowerCase() !== 'نفسه') product.price = mPrice.content;
                            saveProducts(products);
                            interaction.channel.send('✅ تم تعديل المنتج بنجاح!');
                        });
                    });
                });
            });
        });
    });
};