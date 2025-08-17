const { EmbedBuilder } = require('discord.js');

module.exports = async function logEvent(client, type, details) {
    const channel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
    if(!channel) return;
    const embed = new EmbedBuilder()
        .setTitle(`📝 حدث جديد: ${type}`)
        .setDescription(details)
        .setTimestamp();
    channel.send({ embeds: [embed] });
};