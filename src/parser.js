const ParseError = require('./parse-error')

let tokenEqual = ([a, b], [c, d]) => a == c && b == d

let findFromLeft = (haystack, needles) => haystack
    .findIndex(t => needles.some(n => tokenEqual(t, n)))
let findFromRight = (haystack, needles) => [...Array(haystack.length)]
    .map((_, i) => haystack.length - i - 1)
    .find(i => needles.some(n => tokenEqual(n, haystack[i]))) || -1
let findFrom = (from, haystack, needles) => from == 'left'
    ? findFromLeft(haystack, needles)
    : findFromRight(haystack, needles)
let findAll = (haystack, needles) => haystack
    .map((t, i) => needles.some(n => tokenEqual(t, n)) ? i : null)
    .filter(x => x != null)
let splitTokens = (haystack, needles) => findAll(haystack, needles).concat([haystack.length])
    .map((index, j, indices) => haystack.slice(indices[j - 1] + 1 || 0, index))

exports.parse = function(tokens) {
    let grouped = exports.group(tokens)
    let tree = exports.parseExpression(grouped)
    return tree
}

exports.group = function(tokens) {
    let newTokens = []
    let i = 0

    while (i < tokens.length) {
        let [type, open, index] = tokens[i]
        let openingParentheses = ['(', '{', '[']
        let closingParentheses = [')', '}', ']']
        let k = openingParentheses.indexOf(tokens[i][1])

        if (type == 'parenthesis' && k >= 0) {
            let close = closingParentheses[k]
            let depth = 0
            let j = i

            while (++j < tokens.length) {
                if (tokenEqual(tokens[j], ['parenthesis', open])) {
                    depth++
                } else if (tokenEqual(tokens[j], ['parenthesis', close])) {
                    depth--
                    if (depth < 0) break
                }
            }

            newTokens.push([`group${open}${close}`, exports.group(tokens.slice(i + 1, j)), index])
            i = j + 1
        } else {
            newTokens.push(tokens[i])
            i++
        }
    }

    for (let j = 0; j < newTokens.length; j++) {
        let [type, data, index] = newTokens[j]

        if (type == 'group[]') {
            newTokens[j] = ['parsed', exports.parseMatrix(data), index]
        } else if (type == 'group{}') {
            newTokens[j] = ['parsed', exports.parseSet(data), index]
        }
    }

    return newTokens
}

exports.parseMatrix = function(grouped) {
    let data = splitTokens(grouped.slice(1, -1), [['separator', ';']])
        .map(row => splitTokens(row, [['separator', ',']]).map(x => exports.parseExpression(x)))

    return {
        type: 'matrix',
        data,
        index: grouped[0][2]
    }
}

exports.parseSet = function(grouped) {
    let left = splitTokens(grouped.slice(1, -1), [['separator', '|']])
    let right = null

    if (left.length == 1) {
        left = left[0]
    } else if (left.length == 2) {
        [left, right] = left
    } else if (left.length > 2) {
        throw new ParseError('Syntax error: Invalid set description', left[1][2])
    }

    let items = splitTokens(left, [['separator', ',']]).map(x => exports.parseExpression(x))
    let rules = right && splitTokens(right, [['separator', ',']]).map(x => exports.parseForRule(x))

    return {
        type: 'set',
        data: [items, rules],
        index: grouped[0][2]
    }
}

exports.parseForRule = function(grouped) {
    let ifSplit = splitTokens(grouped, [['keyword', 'if']])
    let inRule = ifSplit[0]
    let condition = ifSplit[1] && exports.parseCondition(ifSplit[1])

    if (ifSplit.length > 2)
        throw new ParseError('Syntax error: Unexpected `if` in set generator rule', ifSplit[1][2])
    if (inRule.length != 3)
        throw new ParseError('Syntax error: Expecting `in` statement', inRule[0][2])

    let [first, operator, second] = inRule

    if (!tokenEqual(operator, ['keyword', 'in']))
        throw new ParseError('Syntax error: Expecting `in` keyword', operator[2])

    return {
        type: 'forrule',
        data: [
            {
                type: 'in',
                data: [
                    exports.parseExpression([first]),
                    exports.parseExpression([second]),
                ],
                index: operator[2]
            },
            condition
        ],
        index: first[2]
    }
}

exports.parseCondition = function(grouped) {
    if (grouped.length == 0) {
        return null
    } else if (grouped.length == 1) {
        let [type, tokens, ] = grouped[0]

        if (type == 'group()') {
            return exports.parseCondition(tokens)
        } else {
            let [type, data, index] = grouped[0]
            if (type == 'parsed') return data
            return {type, data, index}
        }
    }

    // For rules

    let forIndex = findFromRight(grouped, [['keyword', 'forall'], ['keyword', 'forany']])

    if (forIndex >= 0) {
        let condition = exports.parseCondition(grouped.slice(0, forIndex))
        let forRule = exports.parseForRule(grouped.slice(forIndex + 1))

        return {
            type: grouped[forIndex][1],
            data: [forRule, condition],
            index: grouped[forIndex][2]
        }
    }

    // And/Or operators

    let operatorPrecedence = ['or', 'and']

    for (let type of operatorPrecedence) {
        let i = findFromLeft(grouped, [['logical', type]])
        if (i < 0) continue

        let left = exports.parseCondition(grouped.slice(0, i))
        let right = exports.parseCondition(grouped.slice(i + 1))

        return {
            type,
            data: [left, right],
            index: grouped[i][2]
        }
    }

    // Not operator

    if (tokenEqual(grouped[0], ['logical', 'not'])) {
        return {
            type: 'not',
            data: exports.parseCondition(grouped.slice(1)),
            index: grouped[0][2]
        }
    }

    // In operator

    let i = findFromLeft(grouped, [['keyword', 'in']])

    if (i >= 0) {
        let left = grouped.slice(0, i)
        let right = grouped.slice(i + 1)
        let negate = false

        if (tokenEqual(left.slice(-1)[0], ['logical', 'not'])) {
            negate = true
            left.pop()
        }

        let result = {
            type: 'in',
            data: [left, right].map(x => exports.parseExpression(x)),
            index: grouped[i][2]
        }

        if (negate) result = {
            type: 'not',
            data: result,
            index: grouped[i - 1][2]
        }

        return result
    }

    // Comparisons

    let indices = findAll(grouped, ['=', '/=', '<=', '<', '>', '>='].map(x => ['compare', x]))

    if (indices.length > 0) {
        let compares = indices.map((i, j) => ({
            type: grouped[i][1],
            data: [
                grouped.slice(indices[j - 1] + 1 || 0, i),
                grouped.slice(i + 1, indices[j + 1] || grouped.length)
            ].map(x => exports.parseExpression(x)),
            index: grouped[i][2]
        }))

        return {
            type: 'compare',
            data: compares,
            index: grouped[0][2]
        }
    }

    return null
}

exports.parseExpression = function(grouped) {
    if (grouped.length == 0) {
        return null
    } else if (grouped.length == 1) {
        let [type, tokens, ] = grouped[0]

        if (type == 'group()') {
            return exports.parseExpression(tokens)
        } else {
            let [type, data, index] = grouped[0]
            if (type == 'parsed') return data
            return {type, data, index}
        }
    }

    // Parse commas

    let splitted = splitTokens(grouped, [['separator', ',']])

    if (splitted.length > 1) {
        return {
            type: 'commas',
            data: splitted.map(x => exports.parseExpression(x)),
            index: grouped[0][2]
        }
    }

    // Parse arithmetic operators

    let operatorPrecedence = [
        [['+', '-'], 'left'],
        [['*', '/'], 'left'],
        [['^'], 'right']
    ]

    for (let [operators, from] of operatorPrecedence) {
        let i = findFrom(from, grouped, operators.map(x => ['operator', x]))
        if (i < 0) continue

        let [, type, index] = grouped[i]
        let left = exports.parseExpression(grouped.slice(0, i))
        let right = exports.parseExpression(grouped.slice(i + 1))

        return {
            type,
            data: [left, right],
            index
        }
    }

    return null
}
