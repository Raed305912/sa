const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, InteractionType } = require('discord.js');
require('dotenv').config();

const addProduct = require('./commands/addProduct');
const editProduct = require('./commands/editProduct');
const deleteProduct = require('./commands/deleteProduct');
const listProducts = require('./commands/listProducts');
const manageAdmins = require('./commands/manageAdmins');
const setStoreChannel = require('./commands/setStoreChannel');
const logEvent = require('./commands/logEvent');
const { loadConfig } = require('./utils/jsonHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    const config = loadConfig();
    const STORE_CHANNEL_ID = config.STORE_CHANNEL_ID;
    if(!STORE_CHANNEL_ID) return console.log("⚠️ لم يتم تحديد قناة المتجر بعد");

    const channel = await client.channels.fetch(STORE_CHANNEL_ID);
    if(!channel) return console.error("❌ قناة المتجر غير موجودة");

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("main_menu")
            .setPlaceholder(client.user.username)
            .addOptions([
                { label: "إضافة منتج", value: "add_product" },
                { label: "تعديل منتج", value: "edit_product" },
                { label: "حذف منتج", value: "delete_product" },
                { label: "قائمة المنتجات", value: "list_products" },
                { label: "إدارة الأدمن", value: "manage_admins" },
                { label: "إدارة السوبر أدمن", value: "manage_superadmins" },
                { label: "إضافة قناة المتجر", value: "set_store_channel" },
                { label: "حقوق المطور", value: "developer_rights" },
                { label: "حالة البوت", value: "bot_status" },
                { label: "حالة السيرفر", value: "server_status" }
            ])
    );

    const embed = new EmbedBuilder()
        .setTitle("لوحة تحكم متجر R~")
        .setDescription(`مرحبا بك <@${process.env.OWNER_ID}> في لوحة تحكم متجر R~ 🎉`);

    await channel.send({ embeds: [embed], components: [row] });
});

client.on('interactionCreate', async interaction => {
    if(interaction.type !== InteractionType.MessageComponent) return;
    if(!interaction.isStringSelectMenu()) return;

    const config = loadConfig();
    const STORE_CHANNEL_ID = config.STORE_CHANNEL_ID;

    switch(interaction.values[0]){
        case 'add_product': return addProduct(interaction, client);
        case 'edit_product': return editProduct(interaction, client);
        case 'delete_product': return deleteProduct(interaction, client);
        case 'list_products': return listProducts(interaction, client);
        case 'manage_admins': return manageAdmins(interaction, 'ادمن', client);
        case 'manage_superadmins': return manageAdmins(interaction, 'سوبر ادمن', client);
        case 'set_store_channel': return setStoreChannel(interaction);
        case 'developer_rights': return interaction.reply({ content: `حقوق المطور <@${process.env.DEVELOPER_ID}>`, ephemeral: true });
        case 'bot_status': return interaction.reply({ content: `✅ البوت شغال: ${client.user.tag}`, ephemeral: true });
        case 'server_status': 
            return interaction.reply({ content: `🖥️ السيرفر: ${interaction.guild.name}\n👥 الأعضاء: ${interaction.guild.memberCount}`, ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);