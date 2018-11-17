# lib-dynamock-nodejs

## Purpose

To create a `Mockgoose`-like implementation of Dynamo DB.

Need info? Check the [Wiki](https://github.com/cbtnuggets/lib-dynamock-nodejs/wiki)
 | or [Create an issue](https://github.com/cbtnuggets/lib-dynamock-nodejs/issues/new)
 | Check [our project Board](https://github.com/cbtnuggets/lib-dynamock-nodejs/projects/)
 | [Ask us on [How to get in touch?]

## Table of Contents

[Introduction](#introduction)
[Requirements](#requirements)
[Installation](#installation)
[Getting Started](#gettingstarted)
[Usage](#usage)
[Support](#support)
[Development](#development)
[The API](#api)
[Roadmap](#roadmap)
[Contributing back](#contibutors)
[License](#license)
[Authors](#authors)

<a name="introduction"></a>
## Introduction 

When working with DynamoDB inside a service, it can be frustrating to work with models because you're simply making API calls to the AWS SDK.

This Library was designed to be a `Mockgoose`-like implementation of Dynamo DB.

<a name="introduction"></a>
## Features

Dynamock allows you to test DynamoDB interactions more easily by mocking out API calls to interact with an in-memory database. 

Dynamock allows your Mocha tests to:
* Validate that your calls to the AWS Dynamo Document Client are correct
* Mimic the actual Document Client calls
* Store Dynamo Models and interact with them

<a name="requirements"></a>
## Requirements

**node.js** installed

**npm** installed

**Amazon DynamoDB** service set up in your AWS account
* Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. With DynamoDB, you can create database tables that can store and retrieve any amount of data, and serve any level of request traffic.

**Mocha** test framework installed
* Mocha is a JavaScript test runner used to organize and execute tests. Mocha runs both on Node.js and in the browser. It provides functionality for testing both synchronous and asynchronous code with a very simple and similar interface. Before you continue, you need to have Mocha installed either globally on your local machine or as a dependency for your project.

<a name="installation"></a>
## Installation

**DISCLAIMER!**
This repository was created over the course of a day and is in what I would declare an `Alpha` stage. There are currently 5 supported methods:
  -Put
  -Get
  -Update
  -Query
  -Delete

_**Do we need any additional installation information?**_

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

<a name="gettingstarted"></a>
## Getting Started

_**Do we need any “getting started” information?**_

_Information that lets contributors how they can download, install, and run your project files, including any helpful .gif files for visual examples (.gif files, etc.)_

<a name="usage"></a>
## Usage

_**Do we need any additional usage information?**_

_Use examples liberally and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate while providing links to more sophisticated examples if they are too long to reasonably include in the README._

**Query Operator**


In the world of DynamoDB there is a such a thing as Conditional Operators (=, >=, <=, !=, begins_with, between), unfortunatly Dynamocks implementation is in it's infancy
and only supports the following Conditional Operators for QueryItem() calls.
  -=
  -begins_with
  -between

Also note that you can combine multiple Conditional Operators for an example query such as

```javascript
const conditionalOperator = 'begins_with(#complex_field, :v_state) and #complex_field between :v_start and :v_stop';
```
The implementations of these methods are explicitly defined to what was needed in the initial implementation for `service-exam-provider` and could potentially be lacking the functionalities needed by yourself.

Don't fret though! It's super simple to modify the mocked behavior of the method - so feel free to submit a PR to increase the functionality.

Mocked behavior contains two data objects specific to the method being mocked, which consists of:
  -Schema: All Dynamo calls contain a number of required and optional parameters. API calls made via Dynamock will utilize JSON-Schema to validate they are correct. The schemas determining the validity of a call can be found at
  `/lib/method_schemas/${method_name}.json`. So if you need more functionality out of a method simply hop into its corresponding Schema and add the necessary parameters.

  -Logic: After an API call has been determined to be Valid according to its Schema, the logic within `lib/method_schemas/${method_name}` is executed! This will interact with the "in-memory" table for the mocked model and may need to be improved upon to fit your use case. **NOTE!** The logic for the currently implemented calls is specific to the needs of Exam-Provider and may be lacking the functionality needed by your mock calls.



<a name="support"></a>
## Support

_**Do we need any Support information?**_

_* We're open to suggestions, feel free to message us on [how to get in touch](URL, etc.) or [Create an issue](https://github.com/cbtnuggets/lib-dynamock-nodejs/issues/new).*
* Pull requests are also welcome!*_

<a name="development"></a>
## Development

_**Do we need any Development information?**_

_For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful for your future self._

_You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser._

<a name="api"></a>
### The API

_**Do we need any API information?**_

_Information about using your product’s API._

<a name="roadmap"></a>
## Roadmap

Here are some features which are either underway or planned:

  -Implementation of AWS errors
  -Improved mock implementations that protect from things such as duplicate entries
  -Improved logic for the querying of Local & Global Secondary Indices
  -Index Validation for Query call
  -.... more and more and more, basically this is still missing a TON of Dynamo features, simple error checking, and on and on and on

If you want to see a new feature feel free to [create a new Issue](https://github.com/cbtnuggets/lib-dynamock-nodejs/issues/new)

<a name="contributors"></a>
## Contributing back

_See (link to) CONTRIBUTING.md  for information on how to contribute._

<a name="license"></a>
## License

_Dynamock is made available under the [Name of License](License URL)._

<a name="authors"></a>
## Authors

Dynamock is created and maintained by Tony Tyrrell.



