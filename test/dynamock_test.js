process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;

const _ = require('lodash');

const tableName = 'test-dynamo-table';
const testModelSchema = {
    id: null,
    name: {
        first: null,
        last: null
    },
    full_name: null
};

const DynamoContentMock = require('../lib/dynamo_method_mocks');
let dynamoInstance;

/* So in here we basically want to validate operations occuring on `Context` */
describe('Dynamock Mock Interface', () => {
    before((done) => {
        done();
    });

    beforeEach((done) => {
        dynamoInstance = new DynamoContentMock();
        done();
    });

    afterEach((done) => {
        dynamoInstance = null;
        done();
    });

    after((done) => {
        done();
    });

    describe('Constructor', () => {
        it('Should properly create an instance of the class and initialize it with starting values.', (done) => {
            /* Should have all supported methods */
            expect(dynamoInstance).to.have.property('methods');
            expect(dynamoInstance.methods).to.be.instanceof(Array);

            /* Should have a tables property that is empty. */
            expect(dynamoInstance).to.have.property('context');
            expect(dynamoInstance.context).to.be.instanceof(Object);
            expect(dynamoInstance).to.have.property('tableNames');
            expect(dynamoInstance.tableNames).to.be.instanceof(Array);
            expect(dynamoInstance).to.have.property('tableSchemas');
            expect(dynamoInstance.tableSchemas).to.be.instanceof(Object);
            done();
        });
    });

    describe('GetContext', () => {
        it('Should return the current context of the object', (done) => {
            expect(dynamoInstance.getContext()).to.eql({});
            done();
        });
    });

    describe('addTable', () => {
        it('Should succesfully insert a table and schema - initializing the contents to nothing.', (done) => {
            dynamoInstance.addTable(tableName, testModelSchema);

            /* Expect our table name to be found in the instances tables. */
            expect(_.includes(dynamoInstance.tableNames, tableName)).to.eql(true);

            /* Expect the table schema to be stored as well. */
            expect(JSON.stringify(dynamoInstance.tableSchemas[tableName])).to.eql(JSON.stringify(testModelSchema));

            /* Lastly the context should contain the table and 0 entries for it. */
            expect(dynamoInstance.context).to.have.property(tableName);
            expect(dynamoInstance.context[tableName]).to.be.instanceof(Array);
            expect(dynamoInstance.context[tableName].length).to.eql(0);
            done();
        });
    });

    describe('invoke', () => {
        describe('PutItem', () => {
            it('should successfully store a correct item in the specified table.', (done) => {
                dynamoInstance.addTable(tableName, testModelSchema);
                const PutParams = {
                    Item: {
                        id: 'burrito',
                        name: {
                            first: 'burr',
                            last: 'ito'
                        }
                    },
                    TableName: tableName
                };
                dynamoInstance.invoke('put', PutParams, tableName)
                    .then((results) => {
                        const dbContents = dynamoInstance.getContext();
                        expect(dbContents[tableName].length).to.eql(1);
                        /* Compare the item in the context to the item we tried to PUT. */
                        expect(JSON.stringify(dbContents[tableName][0])).to.eql(JSON.stringify(PutParams.Item));
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });

            it('should unsuccessfully store a request if missing a required parameter (Item)', (done) => {
                dynamoInstance.addTable(tableName, testModelSchema);
                const PutParams = {
                    TableName: tableName
                };
                dynamoInstance.invoke('put', PutParams, tableName)
                    .then((results) => {
                        done(new Error('We should have thrown a thing at a place.'));
                    })
                    .catch((err) => {
                        expect(err).to.be.instanceof(Array);
                        expect(err.length).to.eql(1);
                        expect(_.includes(err[0], 'instance')).to.eql(true);
                        expect(_.includes(err[0], 'Item')).to.eql(true);
                        done();
                    });
            });
        });

        describe('GetItem', () => {
            it('should successfully retrieve an item in the specified table.', (done) => {
                dynamoInstance.addTable(tableName, testModelSchema);
                /* Lets manually insert our record. */
                const exampleRecord = { id: 'burrito', name: { first: 'tony_the', last: 'tiger' } };
                dynamoInstance.context[tableName].push(exampleRecord);
                const GetParams = {
                    Key: {
                        id: 'burrito'
                    },
                    TableName: tableName
                };

                dynamoInstance.invoke('get', GetParams, tableName)
                    .then((results) => {
                        expect(results).to.eql(exampleRecord);
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });

            it('should unsuccessfully store a request if missing a required parameter (Key)', (done) => {
                dynamoInstance.addTable(tableName, testModelSchema);
                const GetParams = {
                    TableName: tableName
                };
                dynamoInstance.invoke('get', GetParams, tableName)
                    .then((results) => {
                        done(new Error('We should have thrown a thing at a place.'));
                    })
                    .catch((err) => {
                        expect(err).to.be.instanceof(Array);
                        expect(err.length).to.eql(1);
                        expect(_.includes(err[0], 'instance')).to.eql(true);
                        expect(_.includes(err[0], 'Key')).to.eql(true);
                        done();
                    });
            });
        });
        describe('DeleteItem', () => {
            it('should successfully remove an item in the specified table.', (done) => {
                dynamoInstance.addTable(tableName, testModelSchema);
                /* Lets manually insert our record. */
                const exampleRecord = { id: 'burrito', name: { first: 'tony_the', last: 'tiger' } };
                dynamoInstance.context[tableName].push(exampleRecord);

                const DeleteParams = {
                    Key: {
                        id: 'burrito'
                    },
                    TableName: tableName
                };
                /* Our record should exist within the context. */
                expect(dynamoInstance.getContext()).to.eql({ [tableName]: [exampleRecord] });

                dynamoInstance.invoke('delete', DeleteParams, tableName)
                    .then((results) => {
                        expect(results).to.eql([]);
                        /* And now our record should be gone forever. */
                        expect(dynamoInstance.getContext()).to.eql({ [tableName]: [] });
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });

            it('should unsuccessfully store a request if missing a required parameter (Key)', (done) => {
                dynamoInstance.addTable(tableName, testModelSchema);
                const DeleteParams = {
                    TableName: tableName
                };
                dynamoInstance.invoke('delete', DeleteParams, tableName)
                    .then((results) => {
                        done(new Error('We should have thrown a thing at a place.'));
                    })
                    .catch((err) => {
                        expect(err).to.be.instanceof(Array);
                        expect(err.length).to.eql(1);
                        expect(_.includes(err[0], 'instance')).to.eql(true);
                        expect(_.includes(err[0], 'Key')).to.eql(true);
                        done();
                    });
            });
        });

        describe('UpdateItem', () => {
            it('should successfully update attributes on an item in the specified table.', (done) => {
                dynamoInstance.addTable(tableName, testModelSchema);
                /* Lets manually insert our record. */
                const exampleRecord = { id: 'burrito', name: { first: 'tony_the', last: 'tiger' } };
                dynamoInstance.context[tableName].push(exampleRecord);

                const UpdateParams = {
                    Key: {
                        id: 'burrito'
                    },
                    TableName: tableName,
                    UpdateExpression: 'set #name = :value_1',
                    ExpressionAttributeNames: {
                        '#name': 'name'
                    },
                    ExpressionAttributeValues: {
                        ':value_1': {
                            first: 'bob',
                            last: 'the_builder'
                        }
                    }
                };

                /* Our record should exist within the context. */
                expect(dynamoInstance.getContext()).to.eql({ [tableName]: [exampleRecord] });

                dynamoInstance.invoke('update', UpdateParams, tableName)
                    .then((results) => {
                        /* it is possible that we aren't saving the values correctly... */
                        expect(dynamoInstance.getContext()[tableName]).to.eql([{ id: 'burrito', name: { first: 'bob', last: 'the_builder' } }]);
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });

            it('should unsuccessfully store a request if missing a required parameter (Key)', (done) => {
                dynamoInstance.addTable(tableName, testModelSchema);
                const UpdateParams = {
                    TableName: tableName,
                    UpdateExpression: {},
                    ExpressionAttributeValues: {},
                    ExpressionAttributeNames: {}
                };

                dynamoInstance.invoke('update', UpdateParams, tableName)
                    .then((results) => {
                        done(new Error('We should have thrown a thing at a place.'));
                    })
                    .catch((err) => {
                        expect(err).to.be.instanceof(Array);
                        expect(err.length).to.eql(1);
                        expect(_.includes(err[0], 'instance')).to.eql(true);
                        expect(_.includes(err[0], 'Key')).to.eql(true);
                        done();
                    });
            });
        });
        describe('QueryItem', () => {
            it('should successfully run an advanced Query attributes on an item in the specified table.', (done) => {
                dynamoInstance.addTable(tableName, testModelSchema);
                /* Lets manually insert our record. */
                const exampleRecord = { id: 'burrito', name: { first: 'tony_the', last: 'tiger' }, full_name: 'tony_the_tiger' };
                dynamoInstance.context[tableName].push(exampleRecord);

                const QueryParams = {
                    TableName: tableName,
                    IndexName: 'test-secondary-index',
                    KeyConditionExpression: 'full_name = :v_fullName',
                    ExpressionAttributeValues: {
                        ':v_fullName': 'tony_the_tiger'
                    }
                };

                /* Our record should exist within the context. */
                dynamoInstance.invoke('query', QueryParams, tableName)
                    .then((results) => {
                        /* it is possible that we aren't saving the values correctly... */
                        expect(results[0]).to.eql(exampleRecord);
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });

            it('should unsuccessfully store a request if missing a required parameter (Key)', (done) => {
                dynamoInstance.addTable(tableName, testModelSchema);
                const UpdateParams = {
                    TableName: tableName,
                    UpdateExpression: {},
                    ExpressionAttributeValues: {},
                    ExpressionAttributeNames: {}
                };

                dynamoInstance.invoke('update', UpdateParams, tableName)
                    .then((results) => {
                        done(new Error('We should have thrown a thing at a place.'));
                    })
                    .catch((err) => {
                        expect(err).to.be.instanceof(Array);
                        expect(err.length).to.eql(1);
                        expect(_.includes(err[0], 'instance')).to.eql(true);
                        expect(_.includes(err[0], 'Key')).to.eql(true);
                        done();
                    });
            });
        });
    });
});
