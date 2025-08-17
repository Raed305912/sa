const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { loadAdmins, saveAdmins } = require('../utils/jsonHandler');

module.exports = async function manageAdmins(interaction, type){
    const members = await interaction.guild.members.fetch();
    const options = members.map(m => ({ label: m.user.username, value: m.id })).slice(0, 25);

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`add_${type}`)
                .setPlaceholder(`اختر ${type} من القائمة`)
                .addOptions(options)
        );

    interaction.reply({ content: `اختر ${type} من القائمة:`, components: [row], ephemeral: true });
};