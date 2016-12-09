const ParseError = require('./parse-error')

let tokenEqual = ([a, b], [c, d]) => a == c && b == d

let findFromLeft = (haystack, needles) => haystack.findIndex(t => needles.some(n => tokenEqual(t, n)))
let findFromRight = (haystack, needles) => [...Array(haystack.length)]
    .map((_, i) => haystack.length - i - 1)
    .find(i => needles.some(n => tokenEqual(n, haystack[i]))) || -1

let findFrom = (from, haystack, needles) => (from == 'left' ? findFromLeft : findFromRight)(haystack, needles)

exports.parse = function(tokens) {
    let grouped = exports.group(tokens)
    let tree = exports.parseExpression(grouped)
    return tree
}

exports.group = function(tokens) {
    let newTokens = []
    let i = 0

    while (i < tokens.length) {
        if (tokenEqual(tokens[i], ['parenthesis', '('])) {
            let depth = 0
            let j = i

            while (++j < tokens.length) {
                if (tokenEqual(tokens[j], ['parenthesis', '('])) {
                    depth++
                } else if (tokenEqual(tokens[j], ['parenthesis', ')'])) {
                    depth--
                    if (depth < 0) break
                }
            }

            newTokens.push(['group', exports.group(tokens.slice(i + 1, j)), tokens[i][2]])
            i = j + 1
        } else {
            newTokens.push(tokens[i])
            i++
        }
    }

    return newTokens
}

exports.parseExpression = function(grouped) {
    if (grouped.length == 0) {
        return null
    } else if (grouped.length == 1 && grouped[0][0] == 'group') {
        return exports.parseExpression(grouped[0][1])
    } else if (grouped.length == 1) {
        let [type, data, index] = grouped[0]
        return {type, data, index}
    }

    let operatorPrecedence = [
        [[':='], 'right'],
        [['+', '-'], 'left'],
        [['*', '/'], 'left'],
        [['^'], 'right']
    ]

    for (let [operators, from] of operatorPrecedence) {
        operators = operators.map(x => ['operator', x])
        let i = findFrom(from, grouped, operators)

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
