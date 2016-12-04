exports.tokenize = function(input) {
    let tokens = []
    let rules = {
        parenthesis: /^(\(|\)|{|})/,
        separator: /^(,|;|_)/,
        compare: /^(=|(<|>)=?|\/=)/,
        operator: /^(\+|-|\*|\/|\^|:=)/,
        logical: /^(\s+(and|or))\s+/,
        keyword: /^(\s+(\.(\.{2})?|mod|for|if|in|max|min|sum|prod))\s+/,
        number: /^(\d+(\.\d+)?)/,
        identifier: /^([^\d\W_][^\W_]*('|~)*)/,
        ignore: /^(\s+)/
    }

    while (input.length > 0) {
        let token = null
        let length = 0

        for (let type in rules) {
            let matches = rules[type].exec(input)
            if (!matches) continue

            let [, value] = matches

            if (value.length > length) {
                length = value.length
                token = [type, value.trim()]
            }
        }

        if (token && token[0] != 'ignore') tokens.push(token)
        input = input.substr(length)
    }

    return tokens
}
