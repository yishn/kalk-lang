const Decimal = require('decimal.js')

let gcd = (d, e) => e.eq(0) ? d : gcd(e, d.mod(e))
let lcm = (d, e) => d.div(gcd(d, e)).mul(e)

class Number {
    constructor(a, b = 1) {
        this.numerator = new Decimal(a)
        this.denominator = new Decimal(b)

        if (this.denominator.eq(0)) throw new Error('Division by zero')

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
        return new Number(
            this.numerator.mul(n.denominator).add(n.numerator.mul(this.denominator)),
            this.denominator.mul(n.denominator)
        )
    }

    sub(n) {
        return new Number(
            this.numerator.mul(n.denominator).sub(n.numerator.mul(this.denominator)),
            this.denominator.mul(n.denominator)
        )
    }

    mul(n) {
        return new Number(this.numerator.mul(n.numerator), this.denominator.mul(n.denominator))
    }

    div(n) {
        return this.mul(new Number(n.denominator, n.numerator))
    }
}

module.exports = Number
