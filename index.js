const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

const addProduct = require('./commands/addProduct');
const editProduct = require('./commands/editProduct');
const deleteProduct = require('./commands/deleteProduct');
const listProducts = require('./commands/listProducts');
const manageAdmins = require('./commands/manageAdmins');
const setStoreChannel = require('./commands/setStoreChannel');
const searchProduct = require('./commands/searchProduct');
const stats = require('./commands/stats');

const { loadAdmins, loadProducts } = require('./utils/jsonHandler');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => console.log(`✅ Logged in as ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
    if(interaction.isChatInputCommand()){
        const adminsData = loadAdmins();
        const isOwner = interaction.user.id === process.env.OWNER_ID;
        const isSuperAdmin = adminsData.superAdmins.includes(interaction.user.id);
        const isAdmin = adminsData.admins.includes(interaction.user.id);

        if(interaction.commandName === 'setmenu'){
            const embed = new EmbedBuilder()
                .setTitle("لوحة تحكم متجر R~")
                .setDescription(`مرحبا بك <@${interaction.user.id}> 🎉`);

            const row = new ActionRowBuilder();
            const options = [];

            if(isOwner || isSuperAdmin){
                options.push(
                    { label: "إضافة منتج", value: "add_product", emoji: "➕" },
                    { label: "تعديل منتج", value: "edit_product", emoji: "✏️" },
                    { label: "حذف منتج", value: "delete_product", emoji: "🗑️" },
                    { label: "إدارة الأدمن", value: "manage_admins", emoji: "🛡️" },
                    { label: "إدارة السوبر أدمن", value: "manage_superadmins", emoji: "💎" },
                    { label: "إضافة قناة المتجر", value: "set_store_channel", emoji: "📌" }
                );
            } else if(isAdmin){
                options.push({ label: "إضافة منتج", value: "add_product", emoji: "➕" });
            }

            options.push(
                { label: "قائمة المنتجات", value: "list_products", emoji: "📦" },
                { label: "بحث عن منتج", value: "search_product", emoji: "🔍" },
                { label: "حقوق المطور", value: "developer_rights", emoji: "👤" },
                { label: "حالة البوت", value: "bot_status", emoji: "✅" },
                { label: "حالة السيرفر", value: "server_status", emoji: "🖥️" }
            );

            row.addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("main_menu")
                    .setPlaceholder(`${client.user.username} 🎯`)
                    .addOptions(options)
            );

            interaction.reply({ embeds: [embed], components: [row] });
        }

        if(interaction.commandName === 'stats'){
            stats(interaction, client);
        }
    }

    if(interaction.isStringSelectMenu()){
        const adminsData = loadAdmins();
        const isOwner = interaction.user.id === process.env.OWNER_ID;
        const isSuperAdmin = adminsData.superAdmins.includes(interaction.user.id);
        const isAdmin = adminsData.admins.includes(interaction.user.id);

        const value = interaction.values[0];

        if(value === 'add_product' && (isOwner || isSuperAdmin || isAdmin)) return addProduct(interaction, client);
        if(value === 'edit_product' && (isOwner || isSuperAdmin)) return editProduct(interaction, client);
        if(value === 'delete_product' && (isOwner || isSuperAdmin)) return deleteProduct(interaction, client);
        if(value === 'list_products') return listProducts(interaction, client, false);
        if(value === 'search_product') return searchProduct(interaction, client);
        if(value === 'manage_admins' && (isOwner || isSuperAdmin)) return manageAdmins(interaction, 'ادمن', client);
        if(value === 'manage_superadmins' && isOwner) return manageAdmins(interaction, 'سوبر ادمن', client);
        if(value === 'set_store_channel' && (isOwner || isSuperAdmin)) return setStoreChannel(interaction);
        if(value === 'developer_rights') return interaction.reply({ content: `حقوق المطور <@${process.env.DEVELOPER_ID}>`, ephemeral: true });
        if(value === 'bot_status') return interaction.reply({ content: `✅ البوت شغال: ${client.user.tag}`, ephemeral: true });
        if(value === 'server_status') return interaction.reply({ content: `🖥️ السيرفر: ${interaction.guild.name}\n👥 الأعضاء: ${interaction.guild.memberCount}`, ephemeral: true });
    }

    if(interaction.isButton()){
        const [action, productId, index] = interaction.customId.split('_');
        const products = loadProducts();
        const product = products.find(p => p.id.toString() === productId);
        if(!product) return interaction.reply({ content: '🚫 المنتج غير موجود', ephemeral: true });

        let imgIndex = parseInt(index);
        if(action === 'next'){
            imgIndex++;
            if(imgIndex >= product.images.length) imgIndex = product.images.length-1;
        } else if(action === 'prev'){
            imgIndex--;
            if(imgIndex < 0) imgIndex = 0;
        }

        const embed = new EmbedBuilder()
            .setTitle(product.name)
            .setDescription(`${product.desc}\n💰 السعر: ${product.price}`)
            .setImage(product.images[imgIndex]);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`prev_${product.id}_${imgIndex}`)
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`next_${product.id}_${imgIndex}`)
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel('تواصل مع البائع')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/users/${process.env.DEVELOPER_ID}`)
            );

        interaction.update({ embeds: [embed], components: [row] });
    }
});

client.login(process.env.DISCORD_TOKEN);