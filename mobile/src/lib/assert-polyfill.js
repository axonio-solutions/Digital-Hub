function assert(value, message) {
  if (!value) {
    throw new Error(message || 'Assertion failed')
  }
}
assert.ok = assert
assert.equal = function (actual, expected, message) {
  if (actual != expected) {
    throw new Error(message || `Assertion failed: ${actual} != ${expected}`)
  }
}
assert.notEqual = function (actual, expected, message) {
  if (actual == expected) {
    throw new Error(message || `Assertion failed: ${actual} == ${expected}`)
  }
}
assert.strictEqual = function (actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Assertion failed: ${actual} !== ${expected}`)
  }
}
assert.deepStrictEqual = function (actual, expected, message) {
  try {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || 'Assertion failed: deep strict equal')
    }
  } catch {
    throw new Error(message || 'Assertion failed: deep strict equal')
  }
}

module.exports = assert
