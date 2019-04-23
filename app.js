const express = require('express');
const app = express();
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const store = new redisStore({
  ssl: 1000 * 60 * 60 * 24
})

app.use(
  session({
    store,
    secret: 'keyboard cat',
    resave: true,
    rolling: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    },
  })
);

app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  res.setHeader('Access-Control-Allow-Headers', '*');
  //res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// 系统1
if (process.env.SSO_CLIENT1) {
  require('./ssoclient1')(app, store);
  app.listen(6010, () => console.log('now listen 6010'));
}
// 系统2
if (process.env.SSO_CLIENT2) {
  require('./ssoclient2')(app, store);
  app.listen(6020, () => console.log('now listen 6020'));
}

// sso 服务器
if (process.env.SSO_SERVER) {
  require('./ssoserver')(app);
  app.listen(6030, () => console.log('now listen 6030'));
}
