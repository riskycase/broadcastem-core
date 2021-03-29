import Express from 'express';
import path from 'path';

const router = Express.Router();

/* GET home page. */
router.all(
	'/',
	function (
		request: Express.Request,
		response: Express.Response,
		next: Express.NextFunction
	) {
		if (request.method === 'GET') {
			// Gets the information of the files which can be downloaded
			response.sendFile(
				path.resolve(__dirname, '..', '..', 'pages/root.html')
			);
		} else {
			const error: error = new Error(
				'Only GET requests are allowed on this route'
			);
			error.status = 400;
			return next(error);
		}
	}
);

export { router };
