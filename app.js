/*
 * Modules
 */
var express = require('express');
var path = require('path');
var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.json());
  
  app.use(express.static(path.join(__dirname, 'public')));

  //debug error handler
  app.use(express.errorHandler());
  app.locals.pretty = true;

});

/*
 * Routes
 * Add additional views here :-)
 */

//index
app.get('/', require('./routes/index')());

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
