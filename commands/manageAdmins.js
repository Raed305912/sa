const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const ADMINS_FILE = './admins.json';

function loadAdmins() {
    if(!fs.existsSync(ADMINS_FILE)) return { admins: [], superAdmins: [] };
    return JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf8'));
}

function saveAdmins(data) {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(data, null, 2));
}

module.exports = async function manageAdmins(interaction, type) {
    if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: '🚫 ليس لديك صلاحية.', ephemeral: true });

    const guild = interaction.guild;
    const members = await guild.members.fetch();
    const options = members.map(m => ({ label: m.user.username, value: m.user.id }));

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('admin_select')
            .setPlaceholder(`اختر الشخص ليصبح ${type}`)
            .addOptions(options)
    );

    await interaction.reply({ content: `اختر الشخص ليصبح ${type}:`, components: [menu], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id && i.customId === 'admin_select';
    const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', i => {
        const selectedId = i.values[0];
        const data = loadAdmins();
        if(type === 'ادمن') {
            if(!data.admins.includes(selectedId)) data.admins.push(selectedId);
        } else {
            if(!data.superAdmins.includes(selectedId)) data.superAdmins.push(selectedId);
        }
        saveAdmins(data);
        i.reply({ content: `✅ تم إضافة ${type} بنجاح!`, ephemeral: true });
    });
};