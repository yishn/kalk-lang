const ParseError = require('./parse-error')

let tokenEqual = ([a, b], [c, d]) => a == c && b == d

exports.parse = function(tokens) {
    let grouped = exports.group(tokens)
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
    
}
