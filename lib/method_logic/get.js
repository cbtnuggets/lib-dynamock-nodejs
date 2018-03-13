const _ = require('lodash');

module.exports = ((dynamoInstance, params, table) => {
    const keyName = _.head(Object.keys(params.Key));
    const keyValue = params.Key[keyName];

    const results = _.map(dynamoInstance.context[params.TableName], (item) => {
        if (item[keyName] === keyValue) {
            return item;
        }
    });

    return results.length === 1 ? results[0] : results;
});
