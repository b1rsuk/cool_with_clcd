const test = require('node:test');
const assert = require('node:assert');
const { convert, ConversionError } = require('../src/converter');

test('length: km -> m', () => {
  assert.strictEqual(convert(1, 'km', 'm').result, 1000);
});

test('length: mi -> km', () => {
  assert.strictEqual(convert(1, 'mi', 'km').result, 1.609344);
});

test('mass: kg -> lb', () => {
  assert.strictEqual(convert(1, 'kg', 'lb').result, 2.204623);
});

test('temperature: C -> F', () => {
  assert.strictEqual(convert(100, 'C', 'F').result, 212);
});

test('temperature: K -> C', () => {
  assert.strictEqual(convert(273.15, 'K', 'C').result, 0);
});

test('currency: USD -> UAH', () => {
  assert.strictEqual(convert(10, 'usd', 'uah').result, 415);
});

test('rejects mixed categories', () => {
  assert.throws(() => convert(1, 'kg', 'm'), ConversionError);
});

test('rejects unknown unit', () => {
  assert.throws(() => convert(1, 'xyz', 'm'), ConversionError);
});

test('rejects non-numeric value', () => {
  assert.throws(() => convert('abc', 'm', 'km'), ConversionError);
});
