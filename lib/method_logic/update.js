const _ = require('lodash');

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 *
 * From: https://gist.github.com/Yimiprod/7ee176597fef230d1451
 */
function difference(object, base) {
    function changes(object, base) {
        return _.transform(object, function(result, value, key) {
            if (!_.isEqual(value, base[key])) {
                result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
            }
        });
    }
    return changes(object, base);
}

module.exports = ((dynamoInstance, params, table) => {
    /* First thing you need to do is figure our what youre key is... easy! */
    const keyName = _.head(Object.keys(params.Key));
    const keyValue = params.Key[keyName];

    /* Next order of business... What values are you trying to update? */
    /* Well you want to take the values declared within `UpdateExpression` (split , -> split =) */
    const updates = params.UpdateExpression.split(' ');

    // unused for now ---> const updateOperation = updates.slice(0, 1);

    // Build a list of update expression strings
    const { updates: updatesFiltered } = _(updates)
        .map((update) => update.replace(/(set|\n)/gi, ''))
        .compact()
        .reduce((memo, piece) => {
            /**
             * Handle the fact that some update expressions might use commas to delimit
             *
             * @type {String}
             */
            const cleanPiece = piece.replace(/,$/, '');

            if (RegExp(/^#/).test(cleanPiece) && _.isNull(memo.workingUpdate)) { // Test for assignment variable
                memo.workingUpdate = cleanPiece;
            } else if (!_.isNull(memo.workingUpdate) && (
                RegExp(/={1}/).test(cleanPiece) || // Test for valid operator
                RegExp(/^:/).test(cleanPiece) // Test for assignment value
            )) {
                memo.workingUpdate += ` ${cleanPiece}`;
            }

            if (RegExp(/^:/).test(cleanPiece)) { // Complete expression update if have last piece in hand
                memo.updates.push(memo.workingUpdate);
                memo.workingUpdate = null; // reset working so we can move onto next
            }

            return memo;
        }, {
            workingUpdate: null,
            updates: []
        });

    /* Now you're dealing with a list of key value pairs seperated by a `=` */
    let updateObj = {};

    _.forEach(updatesFiltered, (obj) => {
        /* `obj` represents the full equality such as #key = :value, split on = and grab the left side */
        let updateKey = obj.split('=')[0].replace(/\s/g, '');

        /* Get the value of our key - we'll find this in ExpressionAttributeValues */
        let updateVal = obj.split('=')[1].replace(/\s/g, '');
        updateVal = params.ExpressionAttributeValues[updateVal];


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
        }, updateVal);

       /* Perfect! Just merge this new value into our update object! */
        updateObj = _.merge(updateObj, updateKey);
    });

    /* Theoretically now we have an object with the keys to update, and the desired values... */
    /* NOTE - room for improvement here with more advanced _ methods - lot of loops. */
    let updatedObject = {};
    let objectToModify = null;

    _.forEach(dynamoInstance.context[table], (item) => {
        if (item[keyName] === keyValue) {
            // Stash a ref to the original item prior to modifying so we can determine a diff if needed.
            objectToModify = _.cloneDeep(item);

            /* In a nutshell we have an array of objects containing a single property. */
            updatedObject = _.assign(item, updateObj);
        }
    });

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
