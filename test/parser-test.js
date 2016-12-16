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

test('parse simple expressions', t => {
    let input = '5+4*3'
    let grouped = parser.group(tokenize(input))

    t.deepEqual(parser.parseExpression(grouped), {
        "type": "+",
        "data": [
            {"type": "number", "data": "5", "index": 0},
            {
                "type": "*",
                "data": [
                    {"type": "number", "data": "4", "index": 2},
                    {"type": "number", "data": "3", "index": 4}
                ],
                "index": 3
            }
        ],
        "index": 1
    })

    input = '(5+4) * 3'
    grouped = parser.group(tokenize(input))

    t.deepEqual(parser.parse(grouped), {
        "type": "*",
        "data": [
            {
                "type": "+",
                "data": [
                    {"type": "number", "data": "5", "index": 1},
                    {"type": "number", "data": "4", "index": 3}
                ],
                "index": 2
            },
            {"type": "number", "data": "3", "index": 8}
        ],
        "index": 6
    })
})

test('parse matrix', t => {
    let input = '[1, 0, 0; 0, 1, 0; 0, 0, 1]'
    let grouped = parser.group(tokenize(input))

    t.deepEqual(parser.parseExpression(grouped), {
        "type": "matrix",
        "data": [
            [
                {"type": "number", "data": "1", "index": 1},
                {"type": "number", "data": "0", "index": 4},
                {"type": "number", "data": "0", "index": 7}
            ],
            [
                {"type": "number", "data": "0", "index": 10},
                {"type": "number", "data": "1", "index": 13},
                {"type": "number", "data": "0", "index": 16}
            ],
            [
                {"type": "number", "data": "0", "index": 19},
                {"type": "number", "data": "0", "index": 22},
                {"type": "number", "data": "1", "index": 25}
            ]
        ],
        "index": 1
    })
})

test('parse conditions', t => {
    let input = 'x in A or x in B and x not in C'
    let grouped = parser.group(tokenize(input))

    t.deepEqual(parser.parseCondition(grouped), {
        "type": "or",
        "data": [
            {
                "type": "in",
                "data": [
                    {"type": "identifier", "data": "x", "index": 0},
                    {"type": "identifier", "data": "A", "index": 5}
                ],
                "index": 2
            },
            {
                "type": "and",
                "data": [
                    {
                        "type": "in",
                        "data": [
                            {"type": "identifier", "data": "x", "index": 10},
                            {"type": "identifier", "data": "B", "index": 15}
                        ],
                        "index": 12
                    },
                    {
                        "type": "not",
                        "data": {
                            "type": "in",
                            "data": [
                                {"type": "identifier", "data": "x", "index": 21},
                                {"type": "identifier", "data": "C", "index": 30}
                            ],
                            "index": 27
                        },
                        "index": 23
                    }
                ],
                "index": 17
            }
        ],
        "index": 7
    })

    input = '0 <= x, y < 5 /= z'
    grouped = parser.group(tokenize(input))

    t.deepEqual(parser.parseCondition(grouped), {
        "type": "compare",
        "data": [
            {
                "type": "<=",
                "data": [
                    {"type": "number", "data": "0", "index": 0},
                    {
                        "type": "commas",
                        "data": [
                            {"type": "identifier", "data": "x", "index": 5},
                            {"type": "identifier", "data": "y", "index": 8}
                        ],
                        "index": 5
                    }
                ],
                "index": 2
            },
            {
                "type": "<",
                "data": [
                    {
                        "type": "commas",
                        "data": [
                            {"type": "identifier", "data": "x", "index": 5},
                            {"type": "identifier", "data": "y", "index": 8}
                        ],
                        "index": 5
                    },
                    {"type": "number", "data": "5", "index": 12}
                ],
                "index": 10
            },
            {
                "type": "/=",
                "data": [
                    {"type": "number", "data": "5", "index": 12},
                    {"type": "identifier", "data": "z", "index": 17}
                ],
                "index": 14
            }
        ],
        "index": 0
    })
})

test('parse conditions with for rules', t => {
    let input = '0 <= x <= 1 forall [x, y] in A if y /= x'
    let grouped = parser.group(tokenize(input))

    t.deepEqual(parser.parseCondition(grouped), {
        "type": "forall",
        "data": [
            {
                "type": "forrule",
                "data": [
                    {
                        "type": "in",
                        "data": [
                            {
                                "type": "matrix",
                                "data": [
                                    [
                                        {"type": "identifier", "data": "x", "index": 20},
                                        {"type": "identifier", "data": "y", "index": 23}
                                    ]
                                ],
                                "index": 20
                            },
                            {"type": "identifier", "data": "A", "index": 29}
                        ],
                        "index": 26
                    },
                    {
                        "type": "/=",
                        "data": [
                            {"type": "identifier", "data": "y", "index": 34},
                            {"type": "identifier", "data": "x", "index": 39}
                        ],
                        "index": 36
                    }
                ],
                "index": 19
            },
            {
                "type": "compare",
                "data": [
                    {
                        "type": "<=",
                        "data": [
                            {"type": "number", "data": "0", "index": 0},
                            {"type": "identifier", "data": "x", "index": 5}
                        ],
                        "index": 2
                    },
                    {
                        "type": "<=",
                        "data": [
                            {"type": "identifier", "data": "x", "index": 5},
                            {"type": "number", "data": "1", "index": 10}
                        ],
                        "index": 7
                    }
                ],
                "index": 0
            }
        ],
        "index": 12
    })
})

test('parse set', t =>  {
    let input = '{x, y | x in X, y in Y}'
    let grouped = parser.group(tokenize(input))

    t.deepEqual(parser.parseExpression(grouped), {
        "type": "set",
        "data": [
            [
                {
                    "type": "identifier",
                    "data": "x",
                    "index": 1
                },
                {
                    "type": "identifier",
                    "data": "y",
                    "index": 4
                }
            ],
            [
                {
                    "type": "forrule",
                    "data": [
                        {
                            "type": "in",
                            "data": [
                                {
                                    "type": "identifier",
                                    "data": "x",
                                    "index": 8
                                },
                                {
                                    "type": "identifier",
                                    "data": "X",
                                    "index": 13
                                }
                            ],
                            "index": 10
                        },
                        null
                    ],
                    "index": 8
                },
                {
                    "type": "forrule",
                    "data": [
                        {
                            "type": "in",
                            "data": [
                                {
                                    "type": "identifier",
                                    "data": "y",
                                    "index": 16
                                },
                                {
                                    "type": "identifier",
                                    "data": "Y",
                                    "index": 21
                                }
                            ],
                            "index": 18
                        },
                        null
                    ],
                    "index": 16
                }
            ]
        ],
        "index": 1
    })

    input = '{1, 3, ..., 10}'
    grouped = parser.group(tokenize(input))

    t.deepEqual(parser.parseExpression(grouped), {
        "type": "set",
        "data": [
            [
                {
                    "type": "number",
                    "data": "1",
                    "index": 1
                },
                {
                    "type": "number",
                    "data": "3",
                    "index": 4
                },
                {
                    "type": "keyword",
                    "data": "...",
                    "index": 7
                },
                {
                    "type": "number",
                    "data": "10",
                    "index": 12
                }
            ],
            null
        ],
        "index": 1
    })
})

test('parse function call', t => {
    let input = '(a + b) f(x, y)'
    let grouped = parser.group(tokenize(input))

    t.deepEqual(parser.parseExpression(grouped), {
        "type": "*",
        "data": [
            {
                "type": "+",
                "data": [
                    {"type": "identifier", "data": "a", "index": 1},
                    {"type": "identifier", "data": "b", "index": 5}
                ],
                "index": 3
            },
            {
                "type": "call",
                "data": [
                    {"type": "identifier", "data": "f", "index": 8},
                    {
                        "type": "commas",
                        "data": [
                            {"type": "identifier", "data": "x", "index": 10},
                            {"type": "identifier", "data": "y", "index": 13}
                        ],
                        "index": 10
                    }
                ],
                "index": 8
            }
        ],
        "index": 0
    })
})

test('parse assignment', t => {
    let input = 'x := f(n) := n^2 if n >= 0'
    let grouped = parser.group(tokenize(input))

    t.deepEqual(parser.parseAssignment(grouped), {
        "type": "assign",
        "data": [
            {"type": "identifier", "data": "x", "index": 0},
            {
                "type": "call",
                "data": [
                    {"type": "identifier", "data": "f", "index": 5},
                    {"type": "identifier", "data": "n", "index": 7}
                ],
                "index": 5
            },
            {
                "type": "^",
                "data": [
                    {"type": "identifier", "data": "n", "index": 13},
                    {"type": "number", "data": "2", "index": 15}
                ],
                "index": 14
            },
            {
                "type": ">=",
                "data": [
                    {"type": "identifier", "data": "n", "index": 20},
                    {"type": "number", "data": "0", "index": 25}
                ],
                "index": 22
            }
        ],
        "index": 0
    })
})
