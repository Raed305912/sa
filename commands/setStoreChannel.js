const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/jsonHandler');

module.exports = async function setStoreChannel(interaction) {
    if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: '🚫 ليس لديك صلاحية.', ephemeral: true });

    const channels = interaction.guild.channels.cache.filter(c => c.type === 0);
    const options = channels.map(c => ({ label: c.name, value: c.id }));

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('store_channel_select')
            .setPlaceholder('اختر قناة المتجر')
            .addOptions(options)
    );

    await interaction.reply({ content: 'اختر قناة المتجر:', components: [menu], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id && i.customId === 'store_channel_select';
    const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', i => {
        const config = loadConfig();
        config.STORE_CHANNEL_ID = i.values[0];
        saveConfig(config);
        i.reply({ content: `✅ تم تعيين قناة المتجر: <#${i.values[0]}>`, ephemeral: true });
    });
};