/* eslint-disable no-useless-escape */

const _ = require('lodash');

/* So basically we need to apply all of the `conditions` to item, if it pass return it. */
const applyConditionalOperators = (params, item, conditions) => {
    /* How about first you take care of = and make sure your test still passes? */
    const names = params.ExpressionAttributeNames;
    const values = params.ExpressionAttributeValues;

    const checkCondition = {
        /* Behavior for Conditional Operator begins_with */
        begins_with: {
            check: (doc, match, exprNames, exprValues) => {
                /* Step 1 - parse the expression value and name from `match` */
                /* example match: 'begins_with(#complex_field, :v_state)'*/
                match = match.replace(' ', '');
                match = match.replace('begins_with(', '');
                match = match.replace(')', '');
                match = match.split(',');

                /* Check to see if we need to do a attribute lookup */
                let exprName = match[0];
                if (exprName[0] === '#') {
                    exprName = exprNames[exprName];
                }

                let exprVal = match[1];
                exprVal = exprValues[exprVal];

                /* Check if conditions satisfied on doc - return True/False */
                return doc[exprName].startsWith(exprVal);
            }
        },
        /* Behavior for Conditional Operator BETWEEN  */
        between: {
            check: (doc, match, exprNames, exprValues) => {
                /* Example match: '#complex_field between :v_start and :v_stop' */
                match = match.split('between');

                /* Grab the field we'll be searching on. */
                let exprName = match[0].replace(' ', '');
                if (exprName[0] === '#') {
                    exprName = exprNames[exprName];
                }

                /* We need to grab the two values we're BETWEEN */
                const exprValue = match[1].split('and');

                /* Lower bounds. */
                let exprLow = exprValue[0].replace(/\s+/g, '');
                exprLow = exprValues[exprLow];

                /* Upper bounds. */
                let exprHigh = exprValue[1].replace(/\s+/g, '');
                exprHigh = exprValues[exprHigh];

                /* Check if conditions satisfied on doc - return True/False */
                return ((doc[exprName] <= exprHigh) && (doc[exprName] >= exprLow));
            }
        },
        /* Behavior for Conditional Operator =  */
        '=': {
            check: (doc, match, exprNames, exprValues) => {
                /* We dont want no stinking spaces. */
                match = match.replace(/\s+/g, '');
                match = match.split('=');

                let exprName = match[0];
                if (exprName[0] === '#') {
                    exprName = exprNames[exprName];
                }

                let exprValue = match[1];
                exprValue = exprValues[exprValue];

                /* Check if conditions satisfied on doc - return True/False */
                return (doc[exprName] === exprValue);
            }
        },
        '>': {
            check: (doc, match, exprNames, exprValues) => {
                /* We dont want no stinking spaces. */
                match = match.replace(/\s+/g, '');
                match = match.split('>');

                let exprName = match[0];
                if (exprName[0] === '#') {
                    exprName = exprNames[exprName];
                }

                let exprValue = match[1];
                exprValue = exprValues[exprValue];

                /* Check if conditions satisfied on doc - return True/False */
                return (doc[exprName] > exprValue);
            }
        },
        '>=': {
            check: (doc, match, exprNames, exprValues) => {
                /* We dont want no stinking spaces. */
                match = match.replace(/\s+/g, '');
                match = match.split('>=');

                let exprName = match[0];
                if (exprName[0] === '#') {
                    exprName = exprNames[exprName];
                }

                let exprValue = match[1];
                exprValue = exprValues[exprValue];

                /* Check if conditions satisfied on doc - return True/False */
                return (doc[exprName] >= exprValue);
            }
        },
        '<': {
            check: (doc, match, exprNames, exprValues) => {
                /* We dont want no stinking spaces. */
                match = match.replace(/\s+/g, '');
                match = match.split('<');

                let exprName = match[0];
                if (exprName[0] === '#') {
                    exprName = exprNames[exprName];
                }

                let exprValue = match[1];
                exprValue = exprValues[exprValue];

                /* Check if conditions satisfied on doc - return True/False */
                return (doc[exprName] < exprValue);
            }
        }
    };

    let validDocument = true;

    _.forOwn(conditions, (value, key) => {
        if (_.isEmpty(value.matches)) {
            return;
        }

        _.forEach(value.matches, (condition) => {
            /* RegExp match is an Array of 3 values - the first is the matched string. */
            const match = _.head(condition);
            validDocument = checkCondition[key].check(item, match, names, values);
        });
    });
    return validDocument;
};

module.exports = ((dynamoInstance, params, table) => {
    /* Sadly we don't even support less than equals to and what not yet - but using regex we can easily XD. */
    //const supportedConditions = ['=', 'between', 'begins_with'];
    const regexConditions = {
        '=': {
            expression: /#?[a-zA-Z\_]+ = :?[0-9a-zA-Z\_\-]+/,
            matches: []
        },
        '<': {
            expression: /#?[a-zA-Z\_]+ < :?[0-9a-zA-Z\_\-]+/,
            matches: []
        },
        '>': {
            expression: /#?[a-zA-Z\_]+ > :?[0-9a-zA-Z\_\-]+/,
            matches: []
        },
        '>=': {
            expression: /#?[a-zA-Z\_]+ >= :?[0-9a-zA-Z\_\-]+/,
            matches: []
        },
        begins_with: {
            expression: /begins_with\(#?[a-zA-z\_]+,[ ]?:?[a-zA-Z\_]+\)/,
            matches: []
        },
        between: {
            expression: /#?[a-zA-z]+ between :[a-zA-Z\_]+ [aA][nN][dD] :[a-zA-z\_]+/,
            matches: []
        }
    };

    const {
        KeyConditionExpression: conditions,
        Select: select,
        AttributesToGet: attributesToGet
    } = params;

    _.forOwn(regexConditions, (value, key) => {
        /* Execute each of our supported Conditional Expressions to look for matches. */
        const match = value.expression.exec(conditions);
        if (!_.isNil(match)) {
            value.matches.push(match);
        }
    });

    const queryResults = _(dynamoInstance.context[table])
        /* Looping through each entry in the table... lets go ahead and check if it matches our conditions? */
        .map((item) => applyConditionalOperators(params, item, regexConditions) ? item : null)
        .compact()
        .value();

    if (_.isUndefined(select)) {
        select = 'ALL_ATTRIBUTES';
    }

    switch (select) {
        case 'ALL_ATTRIBUTES':
        case 'ALL_PROJECTED_ATTRIBUTES': // for now until implemented
            return {
                Count: _.size(queryResults),
                Items: queryResults
            };

        case 'SPECIFIC_ATTRIBUTES':
            return {
                Count: _.size(queryResults),
                Items: _.map(queryResults, (item) => _.pick(item, attributesToGet || []))
            };

        case 'COUNT':
            return {
                Count: _.size(queryResults)
            };

        default:
            throw new Error('Invalid Select value');
    }
});
