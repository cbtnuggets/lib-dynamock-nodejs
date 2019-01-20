# lib-dynamock-nodejs

## Purpose

To create a `Mockgoose` like implementation of DynamoDB that allows developers to write Unit Tests quicker and easier.

Need info? Check the [Wiki](https://github.com/cbtnuggets/lib-dynamock-nodejs/wiki)
 | or [Create an issue](https://github.com/cbtnuggets/lib-dynamock-nodejs/issues/new)
 | Check [our project Board](https://github.com/cbtnuggets/lib-dynamock-nodejs/projects/)
 | [Ask us on [How to get in touch?]

## Table of Contents

* [Introduction](#introduction)
* [Requirements](#requirements)
* [Supported Methods](#supported_methods)
* [Getting Started](#gettingstarted)
* [Usage](#usage)
* [Support](#support)
* [The API](#api)
* [Roadmap](#roadmap)
* [Contributing back](#contibutors)
* [License](#license)
* [Authors](#authors)

<a name="introduction"></a>
## Introduction
When writing REST APIs, Lambdas, or other applications that communicate with DynamoDB, it can be challenge to deal with setting up a DynamoDB instance just for testing.

At the time this Library was originally conceived, AWS had yet to release their DynamoLocal Solution. After they did, we switched from this rough Mock implementation to the official DynamoLocal .jar - only to find that it is great for a local DynamoDB solution, but underperformed when it came to Unit Testing.

A drawback to DynamoDB local is the dependencies it requires to run, when realistically you just want some simple mocked behaviour to test your CRUD application.

Dynamock's goal, comparitively, is to be simple, fast and run where you need it.

<a name="introduction"></a>
## Features
Dynamock allows you to test DynamoDB interactions more easily by mocking out API calls to interact with a simple in-memory data structure.
Under the hood - Dynamock leverages `aws-sdk-mock` (essentailly `Sinon`) to apply mock's to the DynamoDB DocumentClient when it is created/called.

These Mocks interact directly with an in memory Data Structure containing DynamoDB `tables` and one day will provide further validation against Cloudformation Resources and their defined Indices.

Dynamock allows your Mocha tests to:
* Validate that your parameters contained in calls to the AWS Dynamo Document Client are correct.
* Store Dynamo Models and interact with them in a simplistic way so you can test the higher layers of your application.
* Currently supports basic features of PutItem, GetItem, Query, UpdateItem, and DeleteItem.

<a name="requirements"></a>
## Requirements

`Node 6.9.1`
* Async/Await support coming soon. (Node 8+)

**Mocha/Jest** Test framework for whatever you want.
* Mocha is a JavaScript test runner used to organize and execute tests. Before you continue, you need to have Mocha installed either globally on your local machine or as a dependency for your project.

<a name="supported_methods"></a>
## DynamoDB Methods

There are currently 5 supported methods:
  * Put
  * Get
  * Update
  * Query
  * Delete

Validation of methods and feedback is part of the project roadmap. We are constaly trying to match what AWS makes available. Please submit any issues you find.

<a name="gettingstarted"></a>
## Getting Started

Assuming you are already familiar with Node.js/NPM so just go ahead and run:

`npm install --save-dev lib-dynamock-nodejs`.

After you have the Module downloaded and ready for consumption - the below code should get you up and running.
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

it ('should be a test that does a thing', () => {
    const AWS = require("aws-sdk");

    const docClient = new AWS.DynamoDB.DocumentClient({});

    /* This call will be intercepted by Dynamock and instead put the item in our local in-memory data structure. */
    return docClient.putItem(<whatever>).promise();
});
```

<a name="usage"></a>
## Usage
**Query Operator**


In the world of DynamoDB there is such a thing as Conditional Operators (=, >=, <=, !=, begins_with, between), unfortunatly Dynamock's implementation is in it's infancy
and only supports the following Conditional Operators for QueryItem() calls:

  `-=`

  `-begins_with`

  `-between`

Also note that you can combine multiple Conditional Operators for an example query such as

```javascript
const conditionalOperator = 'begins_with(#complex_field, :v_state) and #complex_field between :v_start and :v_stop';
```
The implementations of these methods are explicitly defined to what was needed in the initial implementation of our tested applications and could potentially be lacking the functionalities needed by yourself.

**Don't fret though!** It's super simple to modify the mocked behavior of the method - so feel free to submit a PR to increase the functionality.

Mocked behavior contains two data objects specific to the method being mocked, which consists of:

  -Schema: All Dynamo calls contain a number of required and optional parameters. API calls made via Dynamock will utilize JSON-Schema to validate they are correct. The schemas determining the validity of a call can be found at
  `/lib/method_schemas/${method_name}.js`. So if you need more functionality out of a method simply hop into its corresponding Schema and add the necessary parameters.
  Note that the JSON Schema validation is very RELAXED right now.

  -Logic: After an API call has been determined to be Valid according to its Schema, the logic within `lib/method_schemas/${method_name}` is executed! This will interact with the "in-memory" table for the mocked model and may need to be improved upon to fit your use case. **NOTE!** The logic for the currently implemented calls is specific to the needs of Exam-Provider and may be lacking the functionality needed by your mock calls.



<a name="support"></a>
## Support

We're open to suggestions, feel free to message us at `opensource@cbtnuggets.com` or [Create an issue](https://github.com/cbtnuggets/lib-dynamock-nodejs/issues/new).
_Pull requests are also welcome!_
<a name="roadmap"></a>
## Roadmap
One of the most difficult things concerning Dynamock is where does its features stop - Is this a Unit Test solution or a fully fledged In-Memory datastore that supports even the most advanced DynamoDB Features?

Honestly - we still don't know, we have our own use cases, but that doesn't mean that it couldn't be adopted for more intense cases.

As this project (hopefully) grows - here is a list of what I think Dynamock IS and ISN'T at the time of conception.

Dynamock **IS**:
  * Lightweight
  * In-Memory (No SQLLite, Database files, Redis Stores..)
  * Unit-Testing Solution
  * SDK Compliant  (Validates API Calls according to specified version)
  * Capable of being seeded by CloudFormation and other .yaml/.json resources

Dyanmock **ISN'T**:
  * to be used for Performance testing
  * to be relied on for anything pertaining to Read/Write Capacity Units

Here are some features which are either underway or planned:
  * Implementation of AWS errors (Param Validation, Table Validation, Index Validation, Expression Validation)
  * Improved logic for the creation and interaction of Local & Global Secondary Indices
  * Index Validation for Query calls
  * More DDB features

If you want to see a new feature feel free to [create a new Issue](https://github.com/cbtnuggets/lib-dynamock-nodejs/issues/new)

<a name="contributors"></a>
## Contributing back
Please submit bug reports and feature requests through the Issues tab.

If you would like to submit a pull request, fork the project and make your changes. Create the pull request with the base branch set to `develop`. Include the PR with a corresponding Issue.

Contact `opensource@cbtnuggets.com` directly with any questions you have about contributing to this project.

<a name="license"></a>
## License

_Dynamock is made available under the [MIT](https://opensource.org/licenses/MIT) license._

<a name="authors"></a>
## Authors

Dynamock was created by Tony Tyrrell and is currently maintained by himself and  fellow developers at CBTNuggets.
