const test = require('ava')
const tokenize = require('../src/tokenize')
const parser = require('../src/parser')

test('group input', t => {
    let input = '(-5 - 3.333)*4 + (44 /(6.5+ 2))^3'
    let tokens = tokenize(input)

    t.deepEqual(parser.group(tokens), [
        ['group', [
            ['operator', '-', 1],
            ['number', '5', 2],
            ['operator', '-', 4],
            ['number', '3.333', 6]
        ], 0],
        ['operator', '*', 12],
        ['number', '4', 13],
        ['operator', '+', 15],
        ['group', [
            ['number', '44', 18],
            ['operator', '/', 21],
            ['group', [
                ['number', '6.5', 23],
                ['operator', '+', 26],
                ['number', '2', 28],
            ], 22]
        ], 17],
        ['operator', '^', 31],
        ['number', '3', 32]
    ])
})
