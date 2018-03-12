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
    let updateValues = updates.slice(1, updates.length).join(' ').split(',');

    /* Now you're dealing with a list of key value pairs seperated by a `=` */
    updateValues = _.map(updateValues, (obj) => {
        /* Need to replace the leading hash used by dynamo */
        const updateKey = obj.split('=')[0].replace('#', '').replace(/\s/g, '');
        /* Get the value of our key - we'll find this in ExpressionAttributeValues */
        const val = obj.split('=')[1].replace(' ', '');

        /* Perfect! Lets just go pluck the value in question. */
        const returnObj = {};
        returnObj[updateKey] = params.ExpressionAttributeValues[val.toString()];

        return returnObj;
    });

    /* Theoretically now we have an object with the keys to update, and the desired values... */
    /* NOTE - room for improvement here with more advanced _ methods - lot of loops. */
    let entryToUpdate = _.head(_.map(dynamoInstance.context[table], (item) => {
        if (item[keyName] === keyValue) {
            return item;
        }
    }));

    /* Loop through our desired updates and merge them into our DB entry. */
    _.forEach(updateValues, (updateTo) => {
        entryToUpdate = _.merge({}, entryToUpdate, updateTo);
    });

    /* Remove the old entry from the table. */
    dynamoInstance.context[table] = _.remove(dynamoInstance.context[table], { keyName: keyValue });

    /* Add the updated entry from the table. */
    dynamoInstance.context[table].push(entryToUpdate);

    /* And thats that folks... */
    return entryToUpdate;
});
