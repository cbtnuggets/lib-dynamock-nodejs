const _ = require('lodash');

module.exports = ((dynamoInstance, params, table) => {
    /* Return all items with this "Primary Key" - compact to reduce any falsey values */
    const results = _.compact(_.map(dynamoInstance.context[params.TableName], (item) => {
        /* Seems weird to default to true, but I'm not going to start second guessing past me now... */
        let match = true;

        /* Keep it simple stupid? */
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
