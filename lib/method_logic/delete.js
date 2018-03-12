const _ = require('lodash');
const Q = require('q');
module.exports = ((dynamoInstance, params, table) => {
    const deleteKey = Object.keys(params.Key);
    const deleteValue = _.values(params.Key);

    if (deleteValue.length > 1) {
        return Q.reject('Composite Keys not supported yet - go bug @atyrrell or submit a PR.');
    }

    /* Remove all items from the array that have the deleteKey & deleteValuRemove all items from the array that have the deleteKey & deleteValue */
    dynamoInstance.context[table] = _.remove(dynamoInstance.context[table], (item) => item[deleteKey.toString()] === deleteValue);

    /* This return value might want to change... we chould be returning huge data sets unecessarily */
    return dynamoInstance.context[table];
});
