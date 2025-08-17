const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../products.json');
const ADMINS_FILE = path.join(__dirname, '../admins.json');
const CONFIG_FILE = path.join(__dirname, '../config.json');

module.exports = {
    loadProducts: () => JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8') || '[]'),
    saveProducts: (data) => fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2)),

    loadAdmins: () => JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf8') || '{"admins":[],"superAdmins":[]}'),
    saveAdmins: (data) => fs.writeFileSync(ADMINS_FILE, JSON.stringify(data, null, 2)),

    loadConfig: () => JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8') || '{}'),
    saveConfig: (data) => fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2))
};