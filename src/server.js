const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on :${port}`));

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
