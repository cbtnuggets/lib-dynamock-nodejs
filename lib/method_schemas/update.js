const {
    TableName,
    Key,
    UpdateExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames
} = require('./common_dynamo_schemas');

module.exports = (() => ({
    type: 'object',
    properties: {
        TableName,
        Key,
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues
    },
    required: ['Key', 'TableName', 'UpdateExpression', 'ExpressionAttributeValues'],
    additionalProperties: true
}))();
