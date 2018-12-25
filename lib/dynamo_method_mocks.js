const _ = require('lodash');
const Q = require('q');
const JSONValidator = require('jsonschema').Validator;

const methodLogic = require('./method_logic');

module.exports = (() => {
    /* Class used to mock interaction with a Dynamo Database and ensure that all calls are made correctly. */
    class DynamoContentMock {
        /* Initialize the Context to be nothing. */
        constructor() {
            /* Database contents - keyed by table name. */
            this.context = {};
            this.tableNames = [];
            this.tableSchemas = {};

            /* Contains all AWS methods that are supported. *We're starting simple...* */
            this.methods = ['put', 'get', 'update', 'query', 'delete'];
            return this;
        }

        /* Reach out to our methodSchemas/ and figure out if the given "Params" is valid. */
        validateMethod(methodType, params) {
            if (!_.includes(this.methods, (methodType))) {
                return Q.reject(`Unable to validate an unsupported method of type ${methodType}`);
            }

            const validator = new JSONValidator();
            const schema = require(`./method_schemas/${methodType}.json`);

            let errors = validator.validate(params, schema).errors;
            errors = _.map(errors, (error) => `${error.property} ${error.message}`);

            if (!_.isEmpty(errors)) {
                return Q.reject(errors);
            }

            return Q();
        }

        /* Delete all database entries and table names. */
        reset() {
            this.context = {};
            this.tables = [];
        }

        /* Delete all table contents but leave tables intact. */
        clearTableContents() {
            _.forEach(this.tableNames, (table) => {
                this.context[table] = [];
            });
        }


        getContext() {
            return this.context;
        }

        /* Add a small factory and entry to context that supports `Item`s with the following schema. */
        addTable(tableName, schema) {
            this.tableNames.push(tableName);
            /* Schema should basically be an object with Keys and Null values. */
            this.tableSchemas[tableName] = schema;
            this.context[tableName] = [];

            /* Well now when I go to invoke a method with params... I know what I'm operating on - _.merge? */
        }

        addRecordToTable(tableName, record) {
            this.context[tableName].push(_.cloneDeep(record));
        }

        /* Run the following method with the given parameters on the table specified. */
        invoke(method, params, table) {
            return this.validateMethod(method, params)
                .then(() => methodLogic[method](this, params, table));
        }
    }

    return DynamoContentMock;
})();
