/* Quick and Dirty definitions. */
const nonEmptyString = {
    type: "string",
    minLength: 1
};

// Legacy Operation - replaced by ConditionExpression
const Expected = {};

const ConditionExpression = nonEmptyString;
const ProjectionExpression = nonEmptyString;
const KeyConditionExpression = nonEmptyString;
const UpdateExpression = nonEmptyString;

const ConditionalOperator = {
    type: "string",
    enum :  ["AND", "OR"]
};

/**
 * This is a bit tricky because it should be so closely tied to the Attribute Values.
 * Dynamold validation would assist the user here.
 */
const ExpressionAttributeNames = {
    type: "object"
};

const ExpressionAttributeValues = {
    type: "object"
};

const ReturnConsumedCapacity = {
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
    type: "object"
};

const TableName = nonEmptyString;

const Item = {
    type: "object"
};


module.exports = {
    TableName,
    Item,
    Key,
    ConditionExpression,
    ConditionalOperator,
    ProjectionExpression,
    KeyConditionExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames,
    ReturnConsumedCapacity,
    ReturnItemCollectionMetrics,
    ReturnValues,
    UpdateExpression
};
