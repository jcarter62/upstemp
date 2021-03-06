require('newrelic');

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

//var loader = require('./routes/load');
var show = require('./routes/show');
//var loadandshow = require('./routes/loadandshow');
var hist = require('./routes/history');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
// app.use('/load', loader);
app.use('/show', show);
// app.use('/loadandshow', loadandshow );
app.use('/history', hist);

// Misc local vars
app.locals.rootdir = __dirname;
app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/chartjs', express.static(__dirname + '/node_modules/chart.js/'));
app.use('/static', express.static(__dirname + '/public/'));

// uncomment after placing your favicon in /public
//app.use(favicon(app.locals.rootdir + '/public/favicon.ico'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: "dev"
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    title: "error"
  });
});


module.exports = app;
