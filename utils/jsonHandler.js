const fs = require('fs');
const productsFile = './products.json';

function loadProducts() {
    if(!fs.existsSync(productsFile)) return [];
    return JSON.parse(fs.readFileSync(productsFile, 'utf8'));
}

function saveProducts(products) {
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

module.exports = { loadProducts, saveProducts };