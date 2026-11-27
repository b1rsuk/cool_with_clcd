const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

test('GET /health returns ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, 'ok');
});

test('GET /convert works', async () => {
  const res = await fetch(`${base}/convert?value=5&from=km&to=m`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).result, 5000);
});

test('GET /convert with bad input returns 400', async () => {
  const res = await fetch(`${base}/convert?value=5&from=kg&to=m`);
  assert.strictEqual(res.status, 400);
  assert.ok((await res.json()).error);
});

test('GET /units lists categories', async () => {
  const res = await fetch(`${base}/units`);
  const body = await res.json();
  assert.ok(body.currency.includes('UAH'));
});
