const _ = require('lodash');

const {
    TableName,
    KeyConditionExpression,
    ProjectionExpression,
    ExpressionAttributeValues
} = require('./common_dynamo_schemas');

module.exports = (() => ({
    type: 'object',
    properties: {
        ExpressionAttributeValues,
        KeyConditionExpression,
        ProjectionExpression,
        TableName,
    },
    required: [ 'ExpressionAttributeValues', 'TableName', 'KeyConditionExpression' ],
    additionalProperties: true
}))();
