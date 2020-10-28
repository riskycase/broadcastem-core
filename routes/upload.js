const router = require('express').Router();
const uploadManager = require('../middleware/uploadManager');

/*
 * Runs appropriate action based on data received
 *
 * Takes request, response objects and next callback, returns callback result
 * on error
 */
function uploadResponder(req, res, next) {
	if (req.method === 'POST') {
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
		res.json(
			files.map(file => ({
				sentFileName: file.originalname,
				savedFileName: file.filename,
				size: file.size,
			}))
		);
	} else {
		const error = new Error('Only POST requests are allowed on this route');
		error.status = 400;
		return next(error);
	}
}

/* Receives incoming files */
router.all('/', uploadManager.saveFiles, uploadResponder);

/* Receives incoming folders as zip and extracts them */
router.all('/zip', uploadManager.saveZips, uploadResponder);

module.exports = router;
