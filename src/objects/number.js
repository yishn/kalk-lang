const Decimal = require('decimal.js')

let gcd = (a, b) => b.eq(0) ? a : gcd(b, a.mod(b))
let lcm = (a, b) => a.div(gcd(a, b)).mul(b)

class Number {
    constructor(a, b = 1) {
        this.numerator = new Decimal(a)
        this.denominator = new Decimal(b)

        if (this.denominator.eq(0))
            throw new Error('Number error: Division by zero')

        this.decimal = this.numerator.div(this.denominator)

        if (this.numerator.isInt() && this.denominator.isInt()) {
            let common = gcd(this.numerator, this.denominator)

            this.numerator = this.numerator.div(common)
            this.denominator = this.denominator.div(common)
        } else {
            this.numerator = this.decimal
            this.denominator = new Decimal(1)
        }
    }

    add(n) {
        let common = lcm(this.denominator, n.denominator)

        return new Number(
            this.numerator.mul(common.div(this.denominator))
                .add(n.numerator.mul(common.div(n.denominator))),
            common
        )
    }

    sub(n) {
        return this.add(new Number(n.numerator.neg(), n.denominator))
    }

    mul(n) {
        return new Number(this.numerator.mul(n.numerator), this.denominator.mul(n.denominator))
    }

    div(n) {
        return this.mul(new Number(n.denominator, n.numerator))
    }
}

module.exports = Number
