const express = require('express');
const { convert, listUnits } = require('./converter');

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/version', (req, res) => {
  res.json({ version: process.env.APP_VERSION || 'dev' });
});

app.get('/units', (req, res) => {
  res.json(listUnits());
});

app.get('/convert', (req, res, next) => {
  try {
    const { value, from, to } = req.query;
    res.json(convert(value, from, to));
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.statusCode || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal error' : err.message });
});

module.exports = app;
