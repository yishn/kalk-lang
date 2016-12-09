const test = require('ava')
const tokenize = require('../src/tokenize')

test('tokenize basic math expression', t => {
    let input = '5 - 3*4 + 44 /6^3'

    t.deepEqual(tokenize(input), [
        ['number', '5', 0],
        ['operator', '-', 2],
        ['number', '3', 4],
        ['operator', '*', 5],
        ['number', '4', 6],
        ['operator', '+', 8],
        ['number', '44', 10],
        ['operator', '/', 13],
        ['number', '6', 14],
        ['operator', '^', 15],
        ['number', '3', 16]
    ])

    input = '(-5 - 3.333)*4 + (44 /6.5)^3'

    t.deepEqual(tokenize(input), [
        ['parenthesis', '(', 0],
        ['operator', '-', 1],
        ['number', '5', 2],
        ['operator', '-', 4],
        ['number', '3.333', 6],
        ['parenthesis', ')', 11],
        ['operator', '*', 12],
        ['number', '4', 13],
        ['operator', '+', 15],
        ['parenthesis', '(', 17],
        ['number', '44', 18],
        ['operator', '/', 21],
        ['number', '6.5', 22],
        ['parenthesis', ')', 25],
        ['operator', '^', 26],
        ['number', '3', 27]
    ])
})

test('tokenize decimal numbers', t => {
    let input = '-5 - 3.333*4 + 44 /6.5^3'

    t.deepEqual(tokenize(input), [
        ['operator', '-', 0],
        ['number', '5', 1],
        ['operator', '-', 3],
        ['number', '3.333', 5],
        ['operator', '*', 10],
        ['number', '4', 11],
        ['operator', '+', 13],
        ['number', '44', 15],
        ['operator', '/', 18],
        ['number', '6.5', 19],
        ['operator', '^', 22],
        ['number', '3', 23]
    ])
})

test('tokenize variables', t => {
    let input = 'a1^2+a2^2=5hyp^2'

    t.deepEqual(tokenize(input), [
        ['identifier', 'a1', 0],
        ['operator', '^', 2],
        ['number', '2', 3],
        ['operator', '+', 4],
        ['identifier', 'a2', 5],
        ['operator', '^', 7],
        ['number', '2', 8],
        ['compare', '=', 9],
        ['number', '5', 10],
        ['identifier', 'hyp', 11],
        ['operator', '^', 14],
        ['number', '2', 15]
    ])

    input = 'hyp(a, b)^2 /= c'

    t.deepEqual(tokenize(input), [
        ['identifier', 'hyp', 0],
        ['parenthesis', '(', 3],
        ['identifier', 'a', 4],
        ['separator', ',', 5],
        ['identifier', 'b', 7],
        ['parenthesis', ')', 8],
        ['operator', '^', 9],
        ['number', '2', 10],
        ['compare', '/=', 12],
        ['identifier', 'c', 15]
    ])
})

test('tokenize definitions', t => {
    let input = 'a := 5'

    t.deepEqual(tokenize(input), [
        ['identifier', 'a', 0],
        ['operator', ':=', 2],
        ['number', '5', 5]
    ])

    input = 'f(n) := f(n-1) + f(n-2)'

    t.deepEqual(tokenize(input), [
        ['identifier', 'f', 0],
        ['parenthesis', '(', 1],
        ['identifier', 'n', 2],
        ['parenthesis', ')', 3],
        ['operator', ':=', 5],
        ['identifier', 'f', 8],
        ['parenthesis', '(', 9],
        ['identifier', 'n', 10],
        ['operator', '-', 11],
        ['number', '1', 12],
        ['parenthesis', ')', 13],
        ['operator', '+', 15],
        ['identifier', 'f', 17],
        ['parenthesis', '(', 18],
        ['identifier', 'n', 19],
        ['operator', '-', 20],
        ['number', '2', 21],
        ['parenthesis', ')', 22]
    ])

    input = 'norm(v) := sqrt(sum {v_i^2 | i in {1, ..., #v}})'

    t.deepEqual(tokenize(input), [
        ['identifier', 'norm', 0],
        ['parenthesis', '(', 4],
        ['identifier', 'v', 5],
        ['parenthesis', ')', 6],
        ['operator', ':=', 8],
        ['identifier', 'sqrt', 11],
        ['parenthesis', '(', 15],
        ['identifier', 'sum', 16],
        ['parenthesis', '{', 20],
        ['identifier', 'v', 21],
        ['separator', '_', 22],
        ['identifier', 'i', 23],
        ['operator', '^', 24],
        ['number', '2', 25],
        ['separator', '|', 27],
        ['identifier', 'i', 29],
        ['identifier', 'in', 31],
        ['parenthesis', '{', 34],
        ['number', '1', 35],
        ['separator', ',', 36],
        ['keyword', '...', 38],
        ['separator', ',', 41],
        ['keyword', '#', 43],
        ['identifier', 'v', 44],
        ['parenthesis', '}', 45],
        ['parenthesis', '}', 46],
        ['parenthesis', ')', 47]
    ])
})
