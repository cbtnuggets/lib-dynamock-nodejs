const _ = require('lodash');

const {
    Key,
    TableName
} = require('./common_dynamo_schemas');

module.exports = (() => ({
    type: 'object',
    properties: {
        TableName,
        Key
    },
    required: [ 'Key', 'TableName' ],
    additionalProperties: false
}))();
