const router = require('express').Router();
const uploadManager = require('../middleware/uploadManager');

/* Receive incoming files */
router.all('/', uploadManager.saveFiles , (req, res, next) => {
	if(req.method === 'POST') {
		// Gets information of the files that were uploaded
		const files = req.files;
		// Checks that files were actually uploaded
		if (!files) {
			const error = new Error('Please choose files');
			error.status = 400;
			return next(error);
		}
		// Notifies the server to add new files for sharing
		uploadManager.updateReceivedFiles(files);
		res.send(files.map(file => ({
			name: file.originalname,
			size: file.size
		})));
	}
	else {
		const error = new Error('Only POST requests are allowed on this route');
		error.status = 400;
		return next(error);
	}
});

module.exports = router;
