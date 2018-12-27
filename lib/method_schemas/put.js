const _ = require('lodash');

const {
    TableName,
    Item,
    ConditionExpression,
    ConditionalOperator,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnConsumedCapacity,
    ReturnItemCollectionMetrics
} = require('./common_dynamo_schemas');

module.exports = (() => ({
    type: 'object',
    properties: {
        TableName,
        Item,
        ConditionExpression,
        ConditionalOperator,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnConsumedCapacity,
        ReturnItemCollectionMetrics,
        ReturnValues: {
            type: 'string',
            enum:  ['NONE', 'ALL_OLD']
        }
    },
    required: [ 'Item', 'TableName' ],
    additionalProperties: false
}))();
