# lib-dynamock-nodejs
Creator: Tony Tyrrell

### Purpose
This Library was designed with the intention to be a sort of `Mockgoose` like implementation of Dynamo DB. Basically when you're working with DynamoDB inside of a service, it can be obnoxious to
work with models since you're simply making API Calls to the AWS SDK. Wouldn't it be nice if you could mock out those API calls to interact with an in-memory Database? Allowing your tests to 1) Validate that your
calls to the AWS Dynamo Document Client are correct AND 2) Mimic the actual Document Client calls! Allowing you to store Dynamo Models within your tests and interact with them.

### Implementing Dynamock in your Mocha Tests
Dynamock should make your life testing DynamoDB interactions wayyyy easier. The code below shows utilizing Dynamock within a Mocha test suite.

```javascript
const Dynamock = require('lib-dynamock-nodejs');

... mocha test setup...
/* here you need to define a Dynamo Table you would like to mock, and the corresponding Model "Schema" (all values should be null) */
const mockTableName = 'test-dynamo-table';
const mockTableSchema = {
    test_attribute: null,
    test_attribute_two: {
        value_one: null,
        value_two
    }
};

/* Basically you're going to create a list of tables, in the event you wanted to mock out multiple test tables in a single suite. */
const mockTablesToCreate = [
    {
        tableName: mockTableName,
        tableSchema: mockTableSchema
    }
];

/* Next you want to specify which methods you want to mock (to make sure Dynamock supports them...)*/
const methodToMocks = [
    'put',
    'get',
    'update'
];

/* You will also need to pass in your Mocked AWS context like so */
const AWS = require('aws-sdk-mock');
before((done) => {

    const dynamockInstance = new Dynamock(AWS)
        .createTables(mockTablesToCreate)
        .mockMethods(methodsToMock);

});
```

And thats it! `aws-sdk-mock` will now intercept all Dynamo DocumentClient calls to the `methodsToMock` and execute their mocked logic in /method_logic after validating the calls against the corresponding /method_schema.

#### DISCLAIMER!
This repository was created over the course of a day and is in what I would declare a `Alpha` stage. There are currently 5 supported methods
  -Put
  -Get
  -Update
  -Query
  -Delete

The implementations of these methods are explictly defined to what was needed in the initial implementation for `service-exam-provider` and could potentially be lacking the functionalities needed by yourself.

Don't fret though! It's super simple to modify the mocked behaviour of the method - so feel free to submit a PR to increase the functionality.

Mocked behaviour contains two data objects specific to method being mocked, which consists of:
  -Schema: All Dynamo calls contain a number of required and optional parameters. API calls made via Dynamock will utilize Json-Schema to validate they are correct. The schemas determining the validity of a call can be found at
  `/lib/method_schemas/${method_name}.json`. So if you need more functionality out of a method simply hop into its corresponding Schema and add the necessary parameters.

  -Logic: After an API call has been determined to be Valid according to its Schema, the logic within `lib/method_schemas/${method_name}` is executed! This will interact with the "in-memory" table for the mocked model and may
  need to be improved upon to fit your use case. NOTE! The logic for the currently implemented calls is specific to the needs of Exam-Provider and may be lacking the functionality needed by your mock calls.


#### Future Improvements
  -Implementation of AWS errors
  -Improved mock implementations that protect from things such as duplicate entries
  -Improved logic for the querying of Local & Global Secondary Indices
  -Index Validation for Query call.
  -.... more and more and more, basically this is still missing a TON of Dynamo features, simple error checking, and on and on and on.
