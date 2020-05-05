var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  name : 'app.sid',
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  key: 'express.sessionID',
  /*cookie: { 
    secure: true,
    httpOnly: false,
    expires: false
  }*/
}));

app.use('/*', function (req, res, next) {
  if (
    /^\/sipp\/user\/authorize\?.*/.test(req.originalUrl) || 
    /^\/sipp\/user\/create\?.*/.test(req.originalUrl) ||
    /^\/sipp$/.test(req.originalUrl) ||
    /^\/$/.test(req.originalUrl)
  ) return next();
  console.log("URL: ", req.url);
  if (req.session.user_id) next();
  else {
    res.status(401);
    res.json({ error: "Non authorized" });
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
