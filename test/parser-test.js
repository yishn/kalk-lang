const test = require('ava')
const tokenize = require('../src/tokenize')
const parser = require('../src/parser')

test('group input', t => {
    let input = '(-5 - 3.333)*4 + (44 /(6.5+ 2))^3'
    let tokens = tokenize(input)

    t.deepEqual(parser.group(tokens), [
        ['group()', [
            ['operator', '-', 1],
            ['number', '5', 2],
            ['operator', '-', 4],
            ['number', '3.333', 6]
        ], 0],
        ['operator', '*', 12],
        ['number', '4', 13],
        ['operator', '+', 15],
        ['group()', [
            ['number', '44', 18],
            ['operator', '/', 21],
            ['group()', [
                ['number', '6.5', 23],
                ['operator', '+', 26],
                ['number', '2', 28],
            ], 22]
        ], 17],
        ['operator', '^', 31],
        ['number', '3', 32]
    ])
})

test('parse expression', t => {
    let input = '5+4*3'
    let tokens = tokenize(input)

    t.deepEqual(parser.parse(tokens), {
        "type": "+",
        "data": [
            {
                "type": "number",
                "data": "5",
                "index": 0
            },
            {
                "type": "*",
                "data": [
                    {
                        "type": "number",
                        "data": "4",
                        "index": 2
                    },
                    {
                        "type": "number",
                        "data": "3",
                        "index": 4
                    }
                ],
                "index": 3
            }
        ],
        "index": 1
    })

    input = '(5+4) * 3'
    tokens = tokenize(input)

    t.deepEqual(parser.parse(tokens), {
        "type": "*",
        "data": [
            {
                "type": "+",
                "data": [
                    {
                        "type": "number",
                        "data": "5",
                        "index": 1
                    },
                    {
                        "type": "number",
                        "data": "4",
                        "index": 3
                    }
                ],
                "index": 2
            },
            {
                "type": "number",
                "data": "3",
                "index": 8
            }
        ],
        "index": 6
    })
})

test('parse matrix', t => {
    let input = '[1, 0, 0; 0, 1, 0; 0, 0, 1]'
    let tokens = tokenize(input)

    t.deepEqual(parser.parse(tokens), {
        "type": "matrix",
        "data": [
            [
                {
                    "type": "number",
                    "data": "1",
                    "index": 1
                },
                {
                    "type": "number",
                    "data": "0",
                    "index": 4
                },
                {
                    "type": "number",
                    "data": "0",
                    "index": 7
                }
            ],
            [
                {
                    "type": "number",
                    "data": "0",
                    "index": 10
                },
                {
                    "type": "number",
                    "data": "1",
                    "index": 13
                },
                {
                    "type": "number",
                    "data": "0",
                    "index": 16
                }
            ],
            [
                {
                    "type": "number",
                    "data": "0",
                    "index": 19
                },
                {
                    "type": "number",
                    "data": "0",
                    "index": 22
                },
                {
                    "type": "number",
                    "data": "1",
                    "index": 25
                }
            ]
        ],
        "index": 1
    })
})
