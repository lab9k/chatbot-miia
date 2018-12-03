const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();

const index = require('./routes/index');

const app = express();

const env = process.env.NODE_ENV || 'dev';
app.use(morgan(env === 'development' ? 'dev' : 'combined'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req) => {
  console.log(JSON.stringify(req.body));
});
app.use('/', index);

module.exports = app;
