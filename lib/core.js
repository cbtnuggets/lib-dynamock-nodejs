const _ = require('lodash');
const DynamoMockMethodInterface = require('./dynamo_method_mocks');

/**
 * These objects contain Getter's and Setters used through the event_processor files and kinesis-emitter.
 */
//const { Config } = require('./config');

//const { set: setConfig } = Config;

/**
 * Provides and interface that takes care of loading fixutres and mocking Dynamo API methods.
 */
class Dynamock {
    constructor(awsMockInstance) {
        /**
         * Not sure what to put here yet..
         */
        this.AWS = awsMockInstance;
        this.AWS.restore('DynamoDB.DocumentClient');
        this.dynamockInstance = new DynamoMockMethodInterface();

        return this;
    }

    /* Delete all entries within the current tables. */
    resetTableContents() {
        this.dynamockInstance.clearTableContents();
    }

    reset() {
        this.dynamockInstance.reset();
    }

    /* Array of objects... tablesObject.tableName  && tablesObject.tableSchema */
    createTables(tablesObject) {
        _.forEach(tablesObject, (obj) => {
            if (!_.isNil(obj.tableName) && !_.isNil(obj.tableSchema)) {
                this.dynamockInstance.addTable(obj.tableName, obj.tableSchema);
            }
        });
        return this;
    }

    /* If the specified method is not supported by the library we will just mock it out to return the called parameters. */
    mockMethods(methods) {
        /* For a list of given methods - loop through mocking them out to return mocked behavior, or params. */
        _.forEach(methods, (method) => {
            if (_.includes(this.dynamockInstance.methods, (method))) {
                this.AWS.mock('DynamoDB.DocumentClient', method, (params, cb) => {
                    this.dynamockInstance.validateMethod(method, params)
                        .then(() => cb(null, this.dynamockInstance.invoke(method, params, params.TableName)))
                        .catch((err) => cb(err, null));
                });
            } else {
                this.AWS.mock('DynamoDB.DocumentClient', method, (params, cb) => {
                    cb(null, params);
                });
            }
        });
        return this;
    }

    /* Eventually we want a Dynamo Table to optionally be populated with a file of fixtures. */
    insertFixtures(tableName, fixtureFile) {
        return this;
    }


}

module.exports = Dynamock;
