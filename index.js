const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder, REST, Routes, InteractionType } = require('discord.js');
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
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// تسجيل أمر /setmenu
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder().setName('setmenu').setDescription('عرض منيو المتجر في القناة الحالية')
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

    console.log('✅ أمر /setmenu مسجل');
});

client.on('interactionCreate', async interaction => {
    if(interaction.isChatInputCommand()){
        if(interaction.commandName === 'setmenu'){
            if(interaction.user.id !== process.env.OWNER_ID)
                return interaction.reply({ content: '🚫 ليس لديك صلاحية.', ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle("لوحة تحكم متجر R~")
                .setDescription(`مرحبا بك <@${interaction.user.id}> في لوحة تحكم متجر R~ 🎉`);

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

            interaction.reply({ embeds: [embed], components: [row] });
        }
    }

    // التعامل مع المنيو
    if(interaction.type === InteractionType.MessageComponent){
        switch(interaction.values?.[0]){
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
    }
});

client.login(process.env.DISCORD_TOKEN);