const _ = require('lodash');

module.exports = ((dynamoInstance, params, table) => {
    const keyName = _.head(Object.keys(params.Key));
    const keyValue = params.Key[keyName];

    /* Return all items with this "Hash Key" - compact to reduce any falsey values */
    const results = _.compact(_.map(dynamoInstance.context[params.TableName], (item) => {
        if (item[keyName] === keyValue) {
            return { Item: item };
        }
    }));

    return results.length === 1 ? results[0] : results;
});
