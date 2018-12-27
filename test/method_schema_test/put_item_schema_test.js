/**
 * Tests to validate the expectations asserted by the PutItem Querys - basically, if we call an invalid PutItem we should catch it please and thanks.
 */

const { expect } = require('chai');

const Dynamock = require('../../lib/core');

const mockTableSchema = {
    test_attribute: null,
    test_attribute_two: {
        value_one: null,
        value_two: null
    }
};

const mockTableName = 'wumpus';

/* Basically you're going to create a list of tables, in the event you wanted to mock out multiple test tables in a single suite. */
const mockTablesToCreate = [
    {
        tableName: mockTableName,
        tableSchema: mockTableSchema
    }
];

/* Next you want to specify which methods you want to mock (to make sure Dynamock supports them...)*/
const methodsToMock = ['put'];

/* You will also need to pass in your Mocked AWS context like so */
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
AWSMock.setSDKInstance(AWS);

let documentClient;

/* Biggest question is how are we programmaticly creating these instances based on parameters. */
describe('PutItem Request Validator', () => {
    before(() => {
        new Dynamock(AWSMock)
            .createTables(mockTablesToCreate)
            .mockMethods(methodsToMock);

        documentClient = new AWS.DynamoDB.DocumentClient({
            region: 'foo-1',
            secretAccessKey: '123',
            accessKeyId: '456'
        });
    });

    it('Should not throw an error if the PutItem request contains valid parameters.', () => {
    });

    it('Should throw an error if trying to Put to a table does not exist.', () => {
        /* Iterate over all of the required parameters? */

    });

    it('Should throw an error if the Item does not conform to defined indexes.', () => {

    });
});
