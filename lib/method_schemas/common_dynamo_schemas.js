/* Quick and Dirty definitions. */
const nonEmptyString = {
    type: "string",
    minLength: 1
};

// Legacy Operation - replaced by ConditionExpression
const Expected = {};

const ConditionExpression = nonEmptyString;

const ConditionalOperator = {
    type: "string",
    enum :  ["AND", "OR"]

};

/**
 * This is a bit tricky because it should be so closely tied to the Attribute Values.
 * Dynamold validation would assist the user here.
 */
const ExpressionAttributeNames = {
    type: "object",
    properties: {},
    additionalProperties: true
};

const ExpressionAttributeValues = {
    type: "object",
    properties: {},
    additionalProperties: true
};

const ReturnedConsumedCapacity = {
    type: "string",
    enum: ['INDEXES', 'TOTAL', 'NONE']
};

const ReturnItemCollectionMetrics = {
    type: "string",
    enum: ['SIZE', 'NONE']
};

const ReturnValues = {
    type: "string",
    enum: ['NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW']
};

const Key = {
    type: "object",
    properties: {},
    additionalProperties: 'true'
};

const TableName = nonEmptyString;

const Item = {
    type: "object",
    properties: {},
    additionalProperties: 'true'
};
