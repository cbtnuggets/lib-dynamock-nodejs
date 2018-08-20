const _ = require('lodash');

/**
 * Deep diff between two object, using lodash
 * @param  {Object} newObject Object compared
 * @param  {Object} formerObject   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 *
 * From: https://gist.github.com/Yimiprod/7ee176597fef230d1451
 */
function difference(newObject, formerObject) {
    function changes(_newObject, _formerObject) {
        return _.transform(_newObject, (result, value, key) => {
            if (!_.isEqual(value, _formerObject[key])) {
                result[key] = (_.isObject(value) && _.isObject(_formerObject[key])) ? changes(value, _formerObject[key]) : value;
            }
        });
    }

    return changes(newObject, formerObject);
}

module.exports = ((dynamoInstance, params, table) => {
    // Initialize table if has not been already
    if (!_.isArray(dynamoInstance.context[table])) {
        dynamoInstance.context[table] = [];
    }

    /* First thing you need to do is figure our what youre key is... easy! */
    const keyName = _.head(Object.keys(params.Key));
    const keyValue = params.Key[keyName];

    const {
        UpdateExpression: updateExpression,
        Key: recordKeys
    } = params;

    /* Next order of business... What values are you trying to update? */
    /* Well you want to take the values declared within `UpdateExpression` (split , -> split =) */
    const updates = updateExpression.split(' ');

    // unused for now ---> const updateOperation = updates.slice(0, 1);

    const supportedExpressionFunctions = {
        if_not_exists: (key, value, updateObj) => {
            const { 1: field, 2: fallback } = value.match(/if_not_exists\(#([^,]+),\s?(:[^)]+)/);

            // Determine the value that will be assigned to.
            const newkeyValue = params.ExpressionAttributeNames[key];

            const attributeProperty = params.ExpressionAttributeValues[field] ? field : fallback;
            updateObj[newkeyValue] = params.ExpressionAttributeValues[attributeProperty];

            return updateObj;
        }
    };

    const assignmentValueRegexes = _(supportedExpressionFunctions)
        .keys()
        .reduce((memo, functionName) => {
            memo.push(RegExp(`^${functionName}\\(#[a-z]+,?`, 'i'));

            return memo;
        }, [RegExp(/^:[a-z]+\)/i)]);

    const assignmentValueRegex = RegExp(_.map(assignmentValueRegexes, (v) => v.source).join('|'));

    // Build a list of update expression strings
    const { updates: updatesFiltered } = _(updates)
        .map((update) => update.replace(/(set|\n)/gi, ''))
        .compact()
        .reduce((memo, piece) => {
            if (RegExp(/^#/).test(piece) && _.isNull(memo.workingUpdate)) { // Test for assignment variable
                memo.workingUpdate = piece;
                return memo;
            }

            if (_.isNull(memo.workingUpdate)) {
                // Shouldn't get here...
                return memo;
            }

            if (
                RegExp(/={1}/).test(piece) || // Test for valid operator
                RegExp(/^:\)?/).test(piece) // Test for assignment value
            ) {
                memo.workingUpdate += ` ${piece}`;
            } else if (assignmentValueRegex.test(piece)) {
                memo.workingUpdate += ` ${piece}`;
            }

            if (RegExp(/^:\)?/).test(piece)) { // Complete expression update if have last piece in hand
                const cleanPiece = memo.workingUpdate.replace(/,$/, ''); // Handle the fact that some update expressions might use commas to delimit

                memo.updates.push(cleanPiece);
                memo.workingUpdate = null; // reset working so we can move onto next
            }

            return memo;
        }, {
            workingUpdate: null,
            updates: []
        });

    /* Now you're dealing with a list of key value pairs seperated by a `=` */
    let updateObj = {};

    const deferredObjUpdates = [];

    _.forEach(updatesFiltered, (obj) => {
        /* `obj` represents the full equality such as #key = :value, split on = and grab the left side */
        let updateKey = obj.split('=')[0].replace(/\s/g, '');

        /* Get the value of our key - we'll find this in ExpressionAttributeValues */
        const updateVal = obj.split('=')[1].replace(/\s/g, '');
        const resolvedUpdateVal = params.ExpressionAttributeValues[updateVal];

        const expressionFunctionName = _(supportedExpressionFunctions)
            .keys()
            .find((functionName) => RegExp(`^${functionName}\\(`).test(updateVal));

        if (!_.isUndefined(expressionFunctionName)) {
            deferredObjUpdates.push({
                expressionFunctionName,
                key: updateKey,
                value: updateVal
            });

            return;
        }

        /* updateKey can contain #a.#b.#c for nested attributes - this logic handles nested or top level attributes. */
        updateKey = updateKey.split('.');
        updateKey = _.reduceRight(updateKey, (memo, value) => {
            /* Remove leading #'s from variables. */
            if (value[0] === '#') {
                value = params.ExpressionAttributeNames[value];
            }
            /* By reducing from the right we're essentially just continuously tucking the attributes inside each other. */
            const attribute = {};
            attribute[value] = memo;

            return attribute;
        }, resolvedUpdateVal);

       /* Perfect! Just merge this new value into our update object! */
        updateObj = _.merge(updateObj, updateKey);
    });

    /* Theoretically now we have an object with the keys to update, and the desired values... */
    /* NOTE - room for improvement here with more advanced _ methods - lot of loops. */
    let updatedObject = {};
    let objectToModify = null;

    _.each(deferredObjUpdates, ({ expressionFunctionName, key, value }) => {
        supportedExpressionFunctions[expressionFunctionName].apply(null, [key, value, updateObj]);
    });

    const tableItems = dynamoInstance.context[table];

    const foundItem = _.find(tableItems, recordKeys);

    if (!_.isUndefined(foundItem)) {
        // Stash a ref to the original item prior to modifying so we can determine a diff if needed.
        objectToModify = _.cloneDeep(foundItem);

        /* In a nutshell we have an array of objects containing a single property. */
        updatedObject = _.assign(foundItem, updateObj);
    }

    if (_.isNull(objectToModify)) {
        objectToModify = {};

        dynamoInstance.addRecordToTable(table, _.merge(updateObj, params.Key));

        updatedObject = updateObj;
    }

    const { ReturnValues: returnValues } = params;

    switch (returnValues) {
        case 'NONE':
            return;

        case 'ALL_NEW':
            return { Attributes: updatedObject };

        case 'UPDATED_NEW':
            return { Attributes: difference(updatedObject, objectToModify) };

        default:
            // no op
    }
});
