const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = async function searchProduct(interaction){
    const modal = new ModalBuilder()
        .setCustomId('search_modal')
        .setTitle('البحث عن منتج');

    const input = new TextInputBuilder()
        .setCustomId('search_input')
        .setLabel('اكتب اسم المنتج')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    await interaction.showModal(modal);
};