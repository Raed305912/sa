const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { loadProducts, saveProducts, loadConfig } = require('../utils/jsonHandler');

module.exports = async function addProduct(interaction, client){
    // Modal لجمع بيانات المنتج
    const modal = new ModalBuilder()
        .setCustomId('add_product_modal')
        .setTitle('إضافة منتج');

    const nameInput = new TextInputBuilder().setCustomId('product_name').setLabel('اسم المنتج').setStyle(TextInputStyle.Short).setRequired(true);
    const descInput = new TextInputBuilder().setCustomId('product_desc').setLabel('وصف المنتج').setStyle(TextInputStyle.Paragraph).setRequired(true);
    const priceInput = new TextInputBuilder().setCustomId('product_price').setLabel('سعر المنتج').setStyle(TextInputStyle.Short).setRequired(true);
    const imagesInput = new TextInputBuilder().setCustomId('product_images').setLabel('روابط الصور مفصولة بفاصلة').setStyle(TextInputStyle.Paragraph).setRequired(true);

    modal.addComponents(
        { type: 1, components: [nameInput] },
        { type: 1, components: [descInput] },
        { type: 1, components: [priceInput] },
        { type: 1, components: [imagesInput] }
    );

    await interaction.showModal(modal);

    const filter = i => i.customId === 'add_product_modal' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    interaction.client.once('interactionCreate', async i => {
        if(!i.isModalSubmit()) return;
        if(i.customId !== 'add_product_modal') return;

        const product = {
            id: Date.now(),
            name: i.fields.getTextInputValue('product_name'),
            desc: i.fields.getTextInputValue('product_desc'),
            price: i.fields.getTextInputValue('product_price'),
            images: i.fields.getTextInputValue('product_images').split(',').map(x => x.trim())
        };

        const products = loadProducts();
        products.push(product);
        saveProducts(products);

        const STORE_CHANNEL_ID = loadConfig().STORE_CHANNEL_ID;
        const storeChannel = client.channels.cache.get(STORE_CHANNEL_ID);
        if(storeChannel){
            const embed = new EmbedBuilder()
                .setTitle(product.name)
                .setDescription(`${product.desc}\n💰 السعر: ${product.price}`)
                .setImage(product.images[0]);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`prev_${product.id}_0`).setLabel('◀️').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`next_${product.id}_0`).setLabel('▶️').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setLabel('تواصل مع البائع').setStyle(ButtonStyle.Link).setURL(`https://discord.com/users/${process.env.DEVELOPER_ID}`)
                );

            storeChannel.send({ embeds: [embed], components: [row] });
        }

        i.reply({ content: '✅ تم إضافة المنتج بنجاح!', ephemeral: true });
    });
};