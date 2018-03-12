process.env.NODE_ENV = 'test';

const Dynamock = require('../lib/core');

const chai = require('chai');
const expect = chai.expect;

const _ = require('lodash');

let dynamock = null;
/* So in here we basically want to validate operations occuring on `Context` */
describe('Dynamock', () => {
    before((done) => {
        done();
    });

    beforeEach((done) => {
        dynamock = new Dynamock();
        done();
    });

    afterEach((done) => {
        dynamock = null;
        done();
    });

    after((done) => {
        done();
    });

    describe('Constructor', () => {
        it('Should properly create an instance of the class and initialize it with starting values.', (done) => {
            /* Should have all supported methods */
            expect(dynamock).to.have.property('awsInstance');
            expect(dynamock).to.have.property('dynamockInstance');
            expect(dynamock).to.have.property('createTables');
            expect(dynamock).to.have.property('mockMethods');

            /* Ensure the methods we'll be using actually exist. */
            expect(dynamock.dynamockInstance).to.have.property('addTable');
            expect(dynamock.dynamockInstance.addTable).to.be.instanceof(Function);
            expect(dynamock.dynamockInstance).to.have.property('validateMethod');
            expect(dynamock.dynamockInstance.validateMethod).to.be.instanceof(Function);
            expect(dynamock.dynamockInstance).to.have.property('invoke');
            expect(dynamock.dynamockInstance.invoke).to.be.instanceof(Function);

            done();
        });
    });
    describe('createTables', () => {
        it('Should properly create tables within the dynamock instance.', (done) => {
            const testTables = [{
                tableName: 'test-table-1',
                tableSchema: {
                    test_attribute: null
                }
            }];
            /* Should correctly initialize the mocked out Dynamo Tables and Schemas. */
            dynamock.createTables(testTables);
            const instance = dynamock.dynamockInstance;
            expect(_.includes(instance.tableNames, 'test-table-1')).to.eql(true);
            expect(instance.tableSchemas['test-table-1']).to.eql({ test_attribute: null });
            expect(instance.context['test-table-1']).to.be.instanceof(Array);
            expect(instance.context['test-table-1'].length).to.be.eql(0);

            done();
        });
    });
    describe('mockMethods', () => {
        it('Should utilize aws-adk-mock to mock out the supplied methods with predefined logic is they are supporrted.', (done) => {
            /* not sure how else to test this... */
            dynamock.mockMethods(['put', 'update', 'get', 'query', 'delete']);
            done();
        });
    });
});
