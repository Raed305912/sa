const { loadConfig, saveConfig } = require('../utils/jsonHandler');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = async function setStoreChannel(interaction){
    const channels = interaction.guild.channels.cache
        .filter(c => c.isTextBased())
        .map(c => ({ label: c.name, value: c.id }));

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('select_store_channel')
            .setPlaceholder('اختر قناة المتجر')
            .addOptions(channels.slice(0,25))
    );

    await interaction.reply({ content: '📌 اختر قناة المتجر:', components: [row], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id && i.customId === 'select_store_channel';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', i => {
        const channelId = i.values[0];
        const config = loadConfig();
        config.STORE_CHANNEL_ID = channelId;
        saveConfig(config);

        i.update({ content: `✅ تم تعيين قناة المتجر: <#${channelId}>`, components: [] });
    });
};