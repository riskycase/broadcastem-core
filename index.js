const express = require('express');
const path = require('path');
const zip = require('express-easy-zip');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const downloadRouter = require('./routes/download');

const app = express();

const format = ':method request for :url resulted in status code :status - :response-time ms';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(zip());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, './node_modules/uikit/dist/')));

function initialize() {

	app.use('/', indexRouter);
	app.use('/download', downloadRouter);

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		const error = new Error('Resource not found');
		error.status = 404;
		return next(error);
	});

	// error handler
	app.use(function(err, req, res, next) {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = err;

		// render the error page
		res.status(err.status);
		res.render('error');
	});
	
}

module.exports.init = async function(cli){
	
	if(cli.flags.verbose) app.use(logger(format));
	else app.use(logger(format, {
		skip: (req, res) => res.statusCode < 400
	}));
	await require('./middleware/storage').init(cli);
	initialize();
	return app;
	
};

module.exports.refresh = require('./middleware/storage').update;
