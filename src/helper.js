exports.arrayEqual = function(a, b) {
    return a.length == b.length && a.every((x, i) => x == b[i])
}
