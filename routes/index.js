const router = require('express').Router();
const path = require('path');

/* GET home page. */
router.all('/', function (req, res, next) {
	if (req.method === 'GET') {
		// Gets the information of the files which can be downloaded
		res.sendFile(path.resolve(__dirname, '..', 'pages/root.html'));
	} else {
		const error = new Error('Only GET requests are allowed on this route');
		error.status = 400;
		return next(error);
	}
});

module.exports = router;
