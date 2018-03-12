const put = require('./put');
const get = require('./get');
const update = require('./update');
const query = require('./query');
const deleteItem = require('./delete');

/* Explicitly gather the methods we'd like to export. */
module.exports = {
    put,
    get,
    update,
    query,
    delete: deleteItem
};

