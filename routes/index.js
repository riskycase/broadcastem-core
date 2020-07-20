const router = require('express').Router();
const downloadManager = require('../middleware/downloadManager');

/* GET home page. */
router.all('/', function(req, res, next) {
	if(req.method === 'GET') {
		// Gets the information of the files which can be downloaded
		const rows = downloadManager.getRows();
		if(rows.length > 0) res.render('index', { lines : rows });
		else res.render('index', { lines : undefined });
	}
	else {
		const error = new Error('Only GET requests are allowed on this route');
		error.status = 400;
		return next(error);
	}
});

module.exports = router;
