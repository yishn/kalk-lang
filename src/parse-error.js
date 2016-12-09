class ParseError extends Error {
    constructor(message, index) {
        super(message)
        this.index = index
    }
}

module.exports = ParseError
