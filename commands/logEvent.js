const { EmbedBuilder } = require('discord.js');

module.exports = async function logEvent(client, type, details) {
    const LOG_CHANNEL_ID = '1406724922297942198'; // يمكن تغييره لأي قناة لوق
    const channel = await client.channels.fetch(LOG_CHANNEL_ID);
    if(!channel) return;

    const embed = new EmbedBuilder()
        .setTitle(`📝 حدث جديد: ${type}`)
        .setDescription(details)
        .setTimestamp();

    channel.send({ embeds: [embed] });
};