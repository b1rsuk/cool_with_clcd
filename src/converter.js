const { rates } = require('./rates.json');

// Коэффициенты к базовой единице категории
const LENGTH = { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, ft: 0.3048, in: 0.0254 };
const MASS = { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125 };
const TEMP = ['C', 'F', 'K'];

class ConversionError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

function resolve(name) {
  const lower = name.toLowerCase();
  const upper = name.toUpperCase();
  if (lower in LENGTH) return { category: 'length', unit: lower };
  if (lower in MASS) return { category: 'mass', unit: lower };
  if (TEMP.includes(upper)) return { category: 'temperature', unit: upper };
  if (upper in rates) return { category: 'currency', unit: upper };
  throw new ConversionError(`Unknown unit: ${name}`);
}

function toCelsius(v, u) {
  if (u === 'C') return v;
  if (u === 'F') return (v - 32) * 5 / 9;
  return v - 273.15;
}

function fromCelsius(v, u) {
  if (u === 'C') return v;
  if (u === 'F') return v * 9 / 5 + 32;
  return v + 273.15;
}

function convert(value, from, to) {
  const v = Number(value);
  if (value === undefined || value === '' || !Number.isFinite(v)) {
    throw new ConversionError('Parameter "value" must be a number');
  }
  if (!from || !to) throw new ConversionError('Parameters "from" and "to" are required');

  const a = resolve(from);
  const b = resolve(to);
  if (a.category !== b.category) {
    throw new ConversionError(`Cannot convert ${a.category} to ${b.category}`);
  }

  let result;
  switch (a.category) {
    case 'length': result = (v * LENGTH[a.unit]) / LENGTH[b.unit]; break;
    case 'mass': result = (v * MASS[a.unit]) / MASS[b.unit]; break;
    case 'currency': result = (v / rates[a.unit]) * rates[b.unit]; break;
    case 'temperature': result = fromCelsius(toCelsius(v, a.unit), b.unit); break;
  }
  return {
    value: v,
    from: a.unit,
    to: b.unit,
    category: a.category,
    result: Math.round(result * 1e6) / 1e6,
  };
}

function listUnits() {
  return {
    length: Object.keys(LENGTH),
    mass: Object.keys(MASS),
    temperature: TEMP,
    currency: Object.keys(rates),
  };
}

module.exports = { convert, listUnits, ConversionError };
