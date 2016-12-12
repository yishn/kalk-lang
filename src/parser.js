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

    return newTokens
}

exports.parseMatrix = function(grouped) {
    let data = splitTokens(grouped, [['separator', ';']])
        .map(row => splitTokens(row, [['separator', ',']]).map(x => exports.parseExpression(x)))

    return {
        type: 'matrix',
        data,
        index: grouped[0][2]
    }
}

exports.parseExpression = function(grouped) {
    if (grouped.length == 0) {
        return null
    } else if (grouped.length == 1) {
        let [type, tokens, ] = grouped[0]

        if (type == 'group()') {
            return exports.parseExpression(tokens)
        } else if (type == 'group[]') {
            return exports.parseMatrix(tokens)
        } else if (type == 'group{}') {
            return exports.parseSet(tokens)
        } else {
            let [type, data, index] = grouped[0]
            return {type, data, index}
        }
    }

    let operatorPrecedence = [
        [[':='], 'right'],
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
