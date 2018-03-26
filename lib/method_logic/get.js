const _ = require('lodash');

module.exports = ((dynamoInstance, params, table) => {
    /* Return all items with this "Primary Key" - compact to reduce any falsey values */
    const results = _.compact(_.map(dynamoInstance.context[params.TableName], (item) => {
        let match = true;

        _.forEach(params.Key, (value, key) => {
            if (item[key] !== params.Key[key]) {
                match = false;
            }
        });

        if (match) {
            return item;
        }
    }));

    return results.length === 1 ? { Item: results[0] } : results;
});
