const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder, REST, Routes, InteractionType, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRow } = require('discord.js');
require('dotenv').config();

const addProduct = require('./commands/addProduct');
const editProduct = require('./commands/editProduct');
const deleteProduct = require('./commands/deleteProduct');
const listProducts = require('./commands/listProducts');
const manageAdmins = require('./commands/manageAdmins');
const setStoreChannel = require('./commands/setStoreChannel');
const logEvent = require('./commands/logEvent');
const stats = require('./commands/stats');
const { loadConfig } = require('./utils/jsonHandler');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// تسجيل أوامر البوت
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder().setName('setmenu').setDescription('عرض منيو المتجر في القناة الحالية'),
        new SlashCommandBuilder().setName('stats').setDescription('إحصائيات المتجر')
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('✅ أوامر البوت مسجلة');
});

// التعامل مع الأوامر والتفاعلات
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
                    .setPlaceholder(`${client.user.username} 🎯`)
                    .addOptions([
                        { label: "إضافة منتج", value: "add_product", emoji: "➕" },
                        { label: "تعديل منتج", value: "edit_product", emoji: "✏️" },
                        { label: "حذف منتج", value: "delete_product", emoji: "🗑️" },
                        { label: "قائمة المنتجات", value: "list_products", emoji: "📦" },
                        { label: "إدارة الأدمن", value: "manage_admins", emoji: "🛡️" },
                        { label: "إدارة السوبر أدمن", value: "manage_superadmins", emoji: "💎" },
                        { label: "إضافة قناة المتجر", value: "set_store_channel", emoji: "📌" },
                        { label: "حقوق المطور", value: "developer_rights", emoji: "👤" },
                        { label: "حالة البوت", value: "bot_status", emoji: "✅" },
                        { label: "حالة السيرفر", value: "server_status", emoji: "🖥️" },
                        { label: "بحث عن منتج", value: "search_product", emoji: "🔍" }
                    ])
            );

            interaction.reply({ embeds: [embed], components: [row] });
        } else if(interaction.commandName === 'stats'){
            stats(interaction, client);
        }
    }

    // التعامل مع المنيو
    if(interaction.isStringSelectMenu()){
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
            case 'search_product': 
                // فتح Modal للبحث عن المنتج
                const modal = new ModalBuilder()
                    .setCustomId('search_modal')
                    .setTitle('بحث عن المنتج');

                const input = new TextInputBuilder()
                    .setCustomId('search_input')
                    .setLabel('اكتب اسم المنتج')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('اكتب هنا اسم المنتج');

                const row = new ActionRow().addComponents(input);
                modal.addComponents(row);
                return interaction.showModal(modal);
        }
    }

    // التعامل مع Modal البحث
    if(interaction.isModalSubmit()){
        if(interaction.customId === 'search_modal'){
            const search = interaction.fields.getTextInputValue('search_input');
            const listProductsFunc = require('./commands/listProducts');
            return listProductsFunc(interaction, client, search);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);