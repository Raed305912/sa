const { loadAdmins, saveAdmins } = require('../utils/jsonHandler');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = async function manageAdmins(interaction, type, client){
    const users = interaction.guild.members.cache.map(u => ({ label: u.user.username, value: u.id }));
    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('select_admin')
            .setPlaceholder(`اختر ${type} من القائمة`)
            .addOptions(users.slice(0, 25)) // Discord يسمح فقط بـ 25 خيار
    );

    await interaction.reply({ content: `🛡️ اختر ${type}:`, components: [row], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id && i.customId === 'select_admin';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', i => {
        const selectedId = i.values[0];
        const admins = loadAdmins();
        if(type === 'ادمن' && !admins.admins.includes(selectedId)) admins.admins.push(selectedId);
        if(type === 'سوبر ادمن' && !admins.superAdmins.includes(selectedId)) admins.superAdmins.push(selectedId);
        saveAdmins(admins);

        i.update({ content: `✅ تم إضافة ${type} بنجاح!`, components: [] });
    });
};