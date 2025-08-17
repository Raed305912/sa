const fs = require('fs');

function loadProducts() {
    if(!fs.existsSync('./products.json')) fs.writeFileSync('./products.json', '[]');
    return JSON.parse(fs.readFileSync('./products.json', 'utf8'));
}

function saveProducts(data) {
    fs.writeFileSync('./products.json', JSON.stringify(data, null, 2));
}

function loadAdmins() {
    if(!fs.existsSync('./admins.json')) fs.writeFileSync('./admins.json', '{"admins":[],"superAdmins":[]}');
    return JSON.parse(fs.readFileSync('./admins.json', 'utf8'));
}

function saveAdmins(data) {
    fs.writeFileSync('./admins.json', JSON.stringify(data, null, 2));
}

function loadConfig() {
    if(!fs.existsSync('./config.json')) fs.writeFileSync('./config.json', '{}');
    return JSON.parse(fs.readFileSync('./config.json', 'utf8'));
}

function saveConfig(data) {
    fs.writeFileSync('./config.json', JSON.stringify(data, null, 2));
}

module.exports = { loadProducts, saveProducts, loadAdmins, saveAdmins, loadConfig, saveConfig };