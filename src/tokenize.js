const ParseError = require('./parse-error')

function tokenize(input) {
    let tokens = []
    let rules = {
        parenthesis: /^(\(|\)|{|}|\[|\])/,
        separator: /^(,|;|\|)/,
        compare: /^(=|(<|>)=?|\/=)/,
        operator: /^(\+|-|\*|\/|\^|:=)/,
        logical: /^(not|and|or)\b/,
        keyword: /^(\.{3}|#|(_|mod|for(all|any)|if|in)\b)/,
        number: /^\d+(\.\d+)?/,
        identifier: /^[^\d\W][^\W]*('|~)*/,
        ignore: /^(\s+|--.*)/
    }

    let i = 0
    while (i < input.length) {
        let token = null
        let length = 0

        for (let type in rules) {
            let matches = rules[type].exec(input.slice(i))
            if (!matches) continue

            let [value, ] = matches

            if (value.length > length) {
                length = value.length
                token = [type, value.trim(), i]
            }
        }

        if (token && token[0] != 'ignore') {
            tokens.push(token)
        }

        if (length == 0) {
            throw new ParseError('Syntax error: Invalid token', i)
        }

        i += length
    }

    return tokens
}

module.exports = tokenize
