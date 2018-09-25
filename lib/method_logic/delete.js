const _ = require('lodash');

module.exports = ((dynamoInstance, params, table) => {
    const deleteKey = Object.keys(params.Key);
    const deleteValue = _.values(params.Key);
    const valueLength = deleteValue.length;

    if (valueLength > 1) {
        let deleteItem = {};

        // Iterate through each item in the database 
        // and instantiate deleteItem to the item that has the same keys
        _.forEach(dynamoInstance.context[table], (item) => {
            if (_.some([item], params.Key)) {
                deleteItem = item;
            }
        });

        /* Remove Item in the array that is found to have the same keys */
        dynamoInstance.context[table] = _.remove(
            dynamoInstance.context[table], 
            (item) => item !== deleteItem);

        return dynamoInstance.context[table];
    }

    /* Remove all items from the array that have the deleteKey & deleteValuRemove all items from the array that have the deleteKey & deleteValue */
    dynamoInstance.context[table] = _.remove(dynamoInstance.context[table], (item) => item[deleteKey.toString()] === deleteValue);

    /* This return value might want to change... we chould be returning huge data sets unecessarily */
    return dynamoInstance.context[table];
});
