import Express from 'express';
import {
	saveFiles,
	saveZips,
	updateReceivedFiles,
} from '../middleware/uploadManager';

// Express request compatibility for files uploaded
interface ExpressRequestWithFile extends Express.Request {
	files: Array<file>;
}

const router = Express.Router();
/*
 * Runs appropriate action based on data received
 *
 * Takes request, response objects and next callback, returns callback result
 * on error
 */
function uploadResponder(
	request: ExpressRequestWithFile,
	response: Express.Response,
	next: Express.NextFunction
) {
	if (request.method === 'POST') {
		// Gets information of the files that were uploaded
		const files: Array<file> = request.files;
		// Checks that files were actually uploaded
		if (!files) {
			const error: error = new Error('Please choose files');
			error.status = 400;
			return next(error);
		}
		// Notifies the server to add new files for sharing
		updateReceivedFiles(files);
		response.json(
			files.map(file => ({
				sentFileName: file.originalname,
				savedFileName: file.filename,
				size: file.size,
			}))
		);
	} else {
		const error: error = new Error(
			'Only POST requests are allowed on this route'
		);
		error.status = 400;
		return next(error);
	}
}

/* Receives incoming files */
router.all('/', saveFiles, uploadResponder);

/* Receives incoming folders as zip and extracts them */
router.all('/zip', saveZips, uploadResponder);

export { router };
