const { loadConfig } = require('../utils/jsonHandler');

module.exports = async function logEvent(client, type, user, productName){
    const config = loadConfig();
    if(!config.LOG_CHANNEL_ID) return;

    const logChannel = client.channels.cache.get(config.LOG_CHANNEL_ID);
    if(!logChannel) return;

    let msg = '';
    switch(type){
        case 'add_product':
            msg = `✅ قام <@${user.id}> بإضافة المنتج: **${productName}**`;
            break;
        case 'edit_product':
            msg = `✏️ قام <@${user.id}> بتعديل المنتج: **${productName}**`;
            break;
        case 'delete_product':
            msg = `🗑️ قام <@${user.id}> بحذف المنتج: **${productName}**`;
            break;
        case 'add_admin':
            msg = `🛡️ قام <@${user.id}> بإضافة أدمن: **${productName}**`;
            break;
        case 'add_superadmin':
            msg = `💎 قام <@${user.id}> بإضافة سوبر أدمن: **${productName}**`;
            break;
        case 'set_store_channel':
            msg = `📌 قام <@${user.id}> بتعيين قناة المتجر: **${productName}**`;
            break;
    }

    logChannel.send(msg);
};