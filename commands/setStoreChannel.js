const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/jsonHandler');

module.exports = async function setStoreChannel(interaction){
    const channels = interaction.guild.channels.cache.filter(c => c.isTextBased());
    const options = channels.map(c => ({ label: c.name, value: c.id })).slice(0, 25);

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('store_channel_select')
                .setPlaceholder('اختر قناة المتجر')
                .addOptions(options)
        );

    interaction.reply({ content: 'اختر قناة المتجر:', components: [row], ephemeral: true });

    const filter = i => i.customId === 'store_channel_select' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', i => {
        saveConfig({ ...loadConfig(), STORE_CHANNEL_ID: i.values[0] });
        i.update({ content: `✅ تم تعيين قناة المتجر: <#${i.values[0]}>`, components: [] });
    });
};