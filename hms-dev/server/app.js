require('./config/config');
require('./config/db');
require('./config/passportConfig');

var https = require('http');
var options = {};

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const rtsIndex = require('./routes/index.router');
const app = express();
app.all('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  );
  next();
});
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());
app.use('/api', rtsIndex);

app.get('/', (req, res) => {
  res.send('Welcome to Server');
});

app.use(express.static('uploads'));

var server = https.createServer(options, app);

server.listen(process.env.PORT, function () {
  console.log('listening on:', process.env.PORT);
});
