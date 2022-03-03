const express = require('express');
const cors = require('cors');

const config = require('../../config.js');
const endpointHandlers = require('./endpointHandlers.js');
const webHookHandlers = require('./webHookHandlers.js');

const app = express();
app.use(cors());
app.use(express.json());

console.log(`Issuer: ${config.ISSUER}`);

app.get('/', (req, res) => {
  res.send('This is the funAuth API');
});

app.get('/api/public', (req, res) => {
  endpointHandlers.handlePublic(req, res);
});

app.get('/api/private', (req, res) => {
  endpointHandlers.handlePrivate(req, res);
});

app.get('/api/access', (req, res) => {
  endpointHandlers.handleAccess(req, res);
});

app.post('/api/access-hook', (req, res) => {
  webHookHandlers.tokenHandler(req, res);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`funAuth app listening on port ${port}!`));
