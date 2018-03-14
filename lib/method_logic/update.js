const _ = require('lodash');

module.exports = ((dynamoInstance, params, table) => {
    /* First thing you need to do is figure our what youre key is... easy! */
    const keyName = _.head(Object.keys(params.Key));
    const keyValue = params.Key[keyName];

    /* Next order of business... What values are you trying to update? */
    /* Well you want to take the values declared within `UpdateExpression` (split , -> split =) */
    const updates = params.UpdateExpression.split(' ');
    // unused for now ---> const updateOperation = updates.slice(0, 1);

    /* man this makes me miss Python string manipulation... */
    const updateValues = updates.slice(1, updates.length).join(' ').split(',');

    /* Now you're dealing with a list of key value pairs seperated by a `=` */
    const updateObj = {};

    _.forEach(updateValues, (obj) => {
        /* Need to replace the leading hash used by dynamo */
        let updateKey = obj.split('=')[0].replace(/\s/g, '');
        if (updateKey[0] === '#') {
            updateKey = params.ExpressionAttributeNames[updateKey];
        }
        /* Get the value of our key - we'll find this in ExpressionAttributeValues */
        let updateVal = obj.split('=')[1].replace(/\s/g, '');
        updateVal = params.ExpressionAttributeValues[updateVal];

        /* Perfect! Lets just go pluck the value in question. */
        updateObj[updateKey] = updateVal;
    });

    /* Theoretically now we have an object with the keys to update, and the desired values... */
    /* NOTE - room for improvement here with more advanced _ methods - lot of loops. */
    let updatedEntry = {};
    _.forEach(dynamoInstance.context[table], (item) => {
        if (item[keyName] === keyValue) {
            /* In a nutshell we have an array of objects containing a single property. */
            updatedEntry = _.assign(item, updateObj);
        }
    });

    /* And thats that folks... */
    return updatedEntry;
});
