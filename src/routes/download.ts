import Express from 'express';
import { getFiles, fileList } from '../middleware/downloadManager';
import path from 'path';
import archiver from 'archiver';

const router = Express.Router();

interface ExpressResponseWithZip extends Express.Response {
	zip: Function;
}

/* Send a JSON array containing file details in a list */
router.all(
	'/list',
	(
		request: Express.Request,
		response: Express.Response,
		next: Express.NextFunction
	) => {
		if (request.method === 'GET') {
			// Sends an array of JSON objects
			response.json(fileList());
		} else {
			const error: error = new Error(
				'Only GET requests are allowed on this route'
			);
			error.status = 400;
			return next(error);
		}
	}
);

/* Download single file */
router.all(
	'/specific',
	(
		request: Express.Request,
		response: ExpressResponseWithZip,
		next: Express.NextFunction
	) => {
		if (request.method === 'GET') {
			// Gets the index parameter and parses into an array
			const index = request.query.index as string;
			const indices = index ? index.split(',') : undefined;
			// Gets the list of paths for the files it can send
			const fileArray = getFiles();
			// Ensures that the requested indexes are valid
			if (indices && indices.every(index => fileArray[index])) {
				// Checks whether file can be sent directly
				if (indices.length === 1 && !fileArray[indices[0]].folder)
					response.download(fileArray[indices[0]].path);
				else {
					// Creates a zip stream that will be piped to response
					const archive = archiver('zip', {
						store: true,
					});
					archive.on('error', err => {
						const error: error = new Error(err.message);
						error.status = 500;
						return next(error);
					});

					// Sets name depending on number of files requested
					response.attachment(
						indices.length === 1
							? `${path.basename(fileArray[indices[0]].path)}.zip`
							: 'variousFiles.zip'
					);
					archive.pipe(response);

					// Makes a zip file to send to the client
					indices.map(index => {
						const file: file = fileArray[index];
						file.folder
							? archive.directory(
									file.path,
									path.basename(file.path)
							  )
							: archive.append(file.path, {
									name: path.basename(file.path),
							  });
					});

					archive.finalize();
				}
			}
			// Checks that files are available or not
			else if (fileArray.length === 0) {
				const error: error = new Error(
					'There are no files for download!'
				);
				error.status = 403;
				return next(error);
			} else {
				const error: error = new Error('Wrong data supplied!');
				error.status = 400;
				return next(error);
			}
		} else {
			const error: error = new Error(
				'Only GET requests are allowed on this route'
			);
			error.status = 400;
			return next(error);
		}
	}
);

/* Download all files */
router.all(
	'/all',
	(
		request: Express.Request,
		response: ExpressResponseWithZip,
		next: Express.NextFunction
	) => {
		if (request.method === 'GET') {
			// Gets all the paths that can be dumped into the zip
			const fileArray = getFiles();
			// Checks that files are available for download
			if (fileArray.length > 0) {
				// Creates a zip stream that will be piped to response
				const archive = archiver('zip', {
					store: true,
				});
				archive.on('error', err => {
					const error: error = new Error(err.message);
					error.status = 500;
					return next(error);
				});
				archive.pipe(response);

				// Sets name depending on number of files requested
				response.attachment('allFiles.zip');

				// Makes a zip file to send to the client
				fileArray.map(file => {
					file.folder
						? archive.directory(file.path, path.basename(file.path))
						: archive.append(file.path, {
								name: path.basename(file.path),
						  });
				});

				archive.finalize();
			}
			// Throws error when there are no files present
			else {
				const error: error = new Error(
					'There are no files for download!'
				);
				error.status = 403;
				return next(error);
			}
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
