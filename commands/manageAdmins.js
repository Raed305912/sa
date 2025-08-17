const { loadAdmins, saveAdmins } = require('../utils/jsonHandler');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const logEvent = require('./logEvent');

module.exports = async function manageAdmins(interaction, type, client) {
    if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: '🚫 ليس لديك صلاحية.', ephemeral: true });

    const members = await interaction.guild.members.fetch();
    const options = members.map(m => ({ label: m.user.tag, value: m.user.id }));

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`manage_${type}`)
            .setPlaceholder(`اختر ${type}`)
            .addOptions(options)
    );

    await interaction.reply({ content: `اختر ${type} ليتم إضافته:`, components: [menu], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', i => {
        const admins = loadAdmins();
        const id = i.values[0];

        if(type === 'ادمن') {
            if(!admins.admins.includes(id)) admins.admins.push(id);
        } else {
            if(!admins.superAdmins.includes(id)) admins.superAdmins.push(id);
        }

        saveAdmins(admins);
        logEvent(client, `إضافة ${type}`, `تم إضافة ${type}: <@${id}> بواسطة ${interaction.user.tag}`);
        i.reply({ content: `✅ تم إضافة ${type} بنجاح!`, ephemeral: true });
    });
};