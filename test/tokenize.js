const test = require('ava')
const {tokenize} = require('../index')

test('tokenize basic math expression', t => {
    let input = '5 - 3*4 + 44 /6^3'

    t.deepEqual(tokenize(input), [
        ['number', '5'],
        ['operator', '-'],
        ['number', '3'],
        ['operator', '*'],
        ['number', '4'],
        ['operator', '+'],
        ['number', '44'],
        ['operator', '/'],
        ['number', '6'],
        ['operator', '^'],
        ['number', '3']
    ])

    input = '(-5 - 3.333)*4 + (44 /6.5)^3'

    t.deepEqual(tokenize(input), [
        ['parenthesis', '('],
        ['operator', '-'],
        ['number', '5'],
        ['operator', '-'],
        ['number', '3.333'],
        ['parenthesis', ')'],
        ['operator', '*'],
        ['number', '4'],
        ['operator', '+'],
        ['parenthesis', '('],
        ['number', '44'],
        ['operator', '/'],
        ['number', '6.5'],
        ['parenthesis', ')'],
        ['operator', '^'],
        ['number', '3']
    ])
})

test('tokenize decimal numbers', t => {
    let input = '-5 - 3.333*4 + 44 /6.5^3'

    t.deepEqual(tokenize(input), [
        ['operator', '-'],
        ['number', '5'],
        ['operator', '-'],
        ['number', '3.333'],
        ['operator', '*'],
        ['number', '4'],
        ['operator', '+'],
        ['number', '44'],
        ['operator', '/'],
        ['number', '6.5'],
        ['operator', '^'],
        ['number', '3']
    ])
})

test('tokenize variables', t => {
    let input = 'a1^2+a2^2=5hyp^2'

    t.deepEqual(tokenize(input), [
        ['identifier', 'a1'],
        ['operator', '^'],
        ['number', '2'],
        ['operator', '+'],
        ['identifier', 'a2'],
        ['operator', '^'],
        ['number', '2'],
        ['compare', '='],
        ['number', '5'],
        ['identifier', 'hyp'],
        ['operator', '^'],
        ['number', '2']
    ])

    input = 'hyp(a, b)^2 /= c'

    t.deepEqual(tokenize(input), [
        ['identifier', 'hyp'],
        ['parenthesis', '('],
        ['identifier', 'a'],
        ['separator', ','],
        ['identifier', 'b'],
        ['parenthesis', ')'],
        ['operator', '^'],
        ['number', '2'],
        ['compare', '/='],
        ['identifier', 'c']
    ])
})

test('tokenize definitions', t => {
    let input = 'a := 5'

    t.deepEqual(tokenize(input), [
        ['identifier', 'a'],
        ['operator', ':='],
        ['number', '5']
    ])

    input = 'f(n) := f(n-1) + f(n-2) if n >= 2'

    t.deepEqual(tokenize(input), [
        ['identifier', 'f'],
        ['parenthesis', '('],
        ['identifier', 'n'],
        ['parenthesis', ')'],
        ['operator', ':='],
        ['identifier', 'f'],
        ['parenthesis', '('],
        ['identifier', 'n'],
        ['operator', '-'],
        ['number', '1'],
        ['parenthesis', ')'],
        ['operator', '+'],
        ['identifier', 'f'],
        ['parenthesis', '('],
        ['identifier', 'n'],
        ['operator', '-'],
        ['number', '2'],
        ['parenthesis', ')'],
        ['keyword', 'if'],
        ['identifier', 'n'],
        ['compare', '>='],
        ['number', '2']
    ])
})
