const _ = require('lodash');

const {
    TableName,
    Key
} = require('./common_dynamo_schemas');

module.exports = (() => ({
    type: 'object',
    properties: {
        TableName,
        Key
    },
    required: [ 'Key', 'TableName' ],
    additionalProperties: true
}))();
