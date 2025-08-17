const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, InteractionType } = require('discord.js');
require('dotenv').config();

const addProduct = require('./commands/addProduct');
const editProduct = require('./commands/editProduct');
const deleteProduct = require('./commands/deleteProduct');
const listProducts = require('./commands/listProducts');
const manageAdmins = require('./commands/manageAdmins');
const logEvent = require('./commands/logEvent');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const OWNER_ID = process.env.OWNER_ID;
const CHANNEL_ID = '1406724922297942198';

client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    const channel = await client.channels.fetch(CHANNEL_ID);
    if(!channel) return console.error("❌ Channel not found");

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("main_menu")
                .setPlaceholder(client.user.username)
                .addOptions([
                    { label: "إضافة منتج", value: "add_product" },
                    { label: "تعديل منتج", value: "edit_product" },
                    { label: "حذف منتج", value: "delete_product" },
                    { label: "قائمة المنتجات", value: "list_products" },
                    { label: "إدارة الأدمن", value: "manage_admins" },
                    { label: "إدارة السوبر أدمن", value: "manage_superadmins" }
                ])
        );

    const embed = new EmbedBuilder()
        .setTitle("لوحة تحكم متجر R~")
        .setDescription(`مرحبا بك <@${OWNER_ID}> في لوحة تحكم متجر R~ 🎉`);

    await channel.send({ embeds: [embed], components: [row] });
});

client.on('interactionCreate', async interaction => {
    if(interaction.type !== InteractionType.MessageComponent) return;

    if(interaction.isStringSelectMenu() && interaction.customId === 'main_menu') {
        const value = interaction.values[0];

        switch(value){
            case 'add_product': return addProduct(interaction);
            case 'edit_product': return editProduct(interaction);
            case 'delete_product': return deleteProduct(interaction);
            case 'list_products': return listProducts(interaction);
            case 'manage_admins': return manageAdmins(interaction, 'ادمن');
            case 'manage_superadmins': return manageAdmins(interaction, 'سوبر ادمن');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);