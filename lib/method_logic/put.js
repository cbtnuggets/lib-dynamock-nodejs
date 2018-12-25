const _ = require('lodash');


module.exports = ((dynamoInstance, params, table) => {
    /* Modify Params.Item to contain any schema attributes that might not have been included inside the request. */
    let itemEntry = _.cloneDeep(params.Item);
    itemEntry = _.merge({}, dynamoInstance.tableSchemas[table], itemEntry);

    /* Insert item into the Dynamo Instance */
    dynamoInstance.context[params.TableName].push(itemEntry);

    return itemEntry;
});
