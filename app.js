// call the packages we need
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var passport = require('passport')
var flash = require('connect-flash');
// var pg = require('pg')

// define the app using express
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Setting up passport
require('./app_server/configs/passport')(passport); // No need to save, only used in setup
app.use(session({ secret: 'su3g41p4204', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login session
app.use(flash());

// var config = {
//     user: 'postgres',
//     database: 'smartfolio',
//     password: 'Welcome1',
//     host: 'localhost',
//     port: 5432,
//     max: 10,
//     idleTimeoutMillis: 30000,
// };

// const client = new pg.Client(config);
// client.connect(function(err) {
//   if (err) {
//     return console.error('Could not connect to postgres', err);
//   }

//   client.query('SELECT NOW() AS "Time"', function(err, result) {
//     if (err) {
//       return console.error('Error running query', err);
//     }
//     console.log(result.rows[0].Time);
//     client.end();
//   });

// });

// Set up router after Passport is set up
var routes = require('./app_server/routes/routes')(passport);
var routesApi = require('./app_api/routes/api_routes');
app.use('/', routes);
app.use('/api', routesApi);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// to support cross-domain accesses
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;