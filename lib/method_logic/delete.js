const _ = require('lodash');
const Q = require('q');
module.exports = ((dynamoInstance, params, table) => {
    const deleteKey = Object.keys(params.Key);
    const deleteValue = _.values(params.Key);
    const valueLength = deleteValue.length;

    if (valueLength > 1) {
        let deleteItem = {};
        let count = 0; 

        // Iterate through each item in the database 
        // and compare that the deleteValues are similar to the key values 
        _.forEach(dynamoInstance.context[table], (item) => {
            for (let i = 0; i < valueLength; i++) {
                if (_.includes(item, deleteValue[i])) {
                    count++;
                }

                if (count === valueLength) {
                    deleteItem = item; 
                }
            }
            count = 0; 
        });

        /* Remove Item in the array that is found to have the same keys */
        dynamoInstance.context[table] = _.remove(
            dynamoInstance.context[table], 
            (item) => item !== deleteItem);

        return dynamoInstance.context[table];
        //return Q.reject('Composite Keys not supported yet - go bug @atyrrell or submit a PR.');
    }

    /* Remove all items from the array that have the deleteKey & deleteValuRemove all items from the array that have the deleteKey & deleteValue */
    dynamoInstance.context[table] = _.remove(dynamoInstance.context[table], (item) => item[deleteKey.toString()] === deleteValue);

    /* This return value might want to change... we chould be returning huge data sets unecessarily */
    return dynamoInstance.context[table];
});
