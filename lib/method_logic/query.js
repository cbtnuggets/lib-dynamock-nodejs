const _ = require('lodash');

module.exports = ((dynamoInstance, params, table) => {
    const keyValuePair = params.KeyConditionExpression.replace(/\s/g, '').split('=');

    const findKey = keyValuePair[0];
    let findValue = keyValuePair[1];
    findValue = params.ExpressionAttributeValues[findValue];

    return _.map(dynamoInstance.context[table], (item) => {
        if (item[findKey] === findValue) {
            return item;
        }
    });
});
