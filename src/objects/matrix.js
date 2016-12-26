const helper = require('../helper')

let dotProd = (a, b) => a.data[0].map((x, i) => x.mul(b.data[0][i])).reduce((sum, x) => sum.add(x))

class Matrix {
    constructor(data) {
        if (data.length == 0)
            throw new Error('Matrix error: Empty matrix')
        if (!data.every(row => row.length == data[0].length))
            throw new Error('Matrix error: Inconsistent size')

        this.data = data
        this.size = [data.length, data[0].length]
    }

    get(i, j) {
        return this.data[i][j]
    }

    getRow(i) {
        return new Matrix([[...this.data[i]]])
    }

    getCol(j) {
        return new Matrix([...Array(this.size[0])].map((_, i) => [this.get(i, j)]))
    }

    transpose() {
        let [height, width] = this.size
        return new Matrix([...Array(height)].map((_, i) => [...Array(width)].map((_, j) => this.get(j, i))))
    }

    scale(number) {
        return new Matrix(data.map(row => row.map(x => x.mul(number))))
    }

    add(matrix) {
        if (!helper.arrayEqual(this.size, matrix.size))
            throw new Error('Matrix error: Adding two inconsistent matrices')

        return new Matrix(data.map((row, i) => row.map((x, j) => x.add(matrix.get(i, j)))))
    }

    sub(matrix) {
        return this.add(matrix.scale(-1))
    }

    mul(matrix) {
        if (helper.arrayEqual(matrix.size, [1, 1])) {
            return this.scale(matrix.get(0, 0))
        } else if (helper.arrayEqual(this.size, [1, 1])) {
            return matrix.scale(this.get(0, 0))
        }

        if (this.size[1] != matrix.size[0]) {
            if (Math.min(...this.size) == 1
                && Math.min(...matrix.size) == 1
                && Math.max(...this.size) == Math.max(...matrix.size)) {

                let a = this.size[0] == 1 ? this.getRow(0) : this.getCol(0).transpose()
                let b = matrix.size[0] == 1 ? matrix.getRow(0) : matrix.getCol(0).transpose()

                return new Matrix([[dotProd(a, b)]])
            }

            throw new Error('Matrix error: Multiplying two inconsistent matrices')
        }

        let transposed = matrix.transpose()
        let data = [...Array(this.size[0])].map(_ => [...Array(transposed.size[0])])

        for (let i = 0; i < this.size[0]; i++) {
            for (let j = 0; j < transposed.size[0]; j++) {
                let a = this.getRow(0)
                let b = transposed.getRow(0)

                data[i][j] = dotProd(a, b)
            }
        }

        return new Matrix(data)
    }
}

module.exports = Matrix
