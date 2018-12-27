const _ = require('lodash');


module.exports = ((dynamoInstance, params, table) => {
    /* Modify Params.Item to contain any schema attributes that might not have been included inside the request. */
    let itemEntry = _.cloneDeep(params.Item);

    /* To be 100% correct - grab entry from table if it exists (upsert) and return OLD_VALUES if specified. */
    itemEntry = _.merge({}, dynamoInstance.tableSchemas[table], itemEntry);

    /* Insert item into the Dynamo Instance */
    dynamoInstance.context[params.TableName].push(itemEntry);

    if (params.ReturnValues === 'ALL_OLD') {
        /* Return what was there previously. */
        return {};
    }

    return {};
});
