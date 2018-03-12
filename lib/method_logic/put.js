const _ = require('lodash');

module.exports = ((dynamoInstance, params, table) => {
    /* Modify Params.Item to contain any schema attributes that might not have been included inside the request. */
    params.Item = _.merge(dynamoInstance.tableSchemas[table], params.Item);

    /* Insert item into the Dynamo Instance */
    dynamoInstance.context[params.TableName].push(params.Item);

    return params.Item;
});
