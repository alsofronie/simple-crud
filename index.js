const express = require('express');
const parser = require('body-parser');
const config = require('./lib/config');
const router = require('./lib/router');

const app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(config.api.prefix, router);

app.listen(config.api.port, () => {
  console.log('Listening to ' + config.api.prefix + ' on port ' + config.api.port);
});