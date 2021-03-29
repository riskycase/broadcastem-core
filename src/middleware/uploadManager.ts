import busboy from 'busboy';
import unzip from 'unzip-stream';
import fs from 'fs';
import path from 'path';
import Express from 'express';

import { destination, updateReceivedFiles } from './fileManager';

interface ExpressRequestWithFile extends Express.Request {
	files: Array<file>;
}

/*
 * Returns a unique name for the file to prevent overwriting
 *
 * Takes parent directory and name of file/directory, returns a resolved path
 */
function uniqueName(name: string, folder: boolean): file {
	const parent = destination;
	let number: number = 0;
	let filename: string;
	do
		filename = `${path.basename(name, path.extname(name))}${
			number-- || ''
		}${folder ? '' : path.extname(name)}`;
	while (fs.existsSync(path.resolve(parent, filename)));
	return {
		path: path.resolve(parent, filename),
		originalname: name,
		filename: filename,
		size: -1,
		folder: folder,
	};
}

/*
 * Extracts a zip stream to destination directory and returns final size
 *
 * Takes parent directory and zip stream, returns a promise that resolves with
 * the size of the extracted folder
 */
function fileWriter(
	filePath: string,
	fileStream: NodeJS.ReadWriteStream
): Promise<number> {
	return new Promise((resolve, reject) => {
		fs.mkdirSync(path.dirname(filePath), {
			recursive: true,
		});
		const destStream = fs
			.createWriteStream(filePath)
			.on('close', () => {
				resolve(destStream.bytesWritten);
			})
			.on('error', reject);
		fileStream.pipe(destStream);
	});
}

/*
 * Extracts a zip stream to destination directory and returns final size
 *
 * Takes parent directory and zip stream, returns a promise that resolves with
 * the size of the extracted folder
 */
function extracter(
	destination: string,
	zipstream: NodeJS.ReadableStream
): Promise<number> {
	return new Promise((resolve, reject) => {
		let size: number = 0;
		let entries: number = 0;
		const unzipper = unzip
			.Parse()
			.on('error', reject)
			.on('entry', (entry: unzip.Entry) => {
				entries++;
				if (entry.type === 'Directory') {
					entries--;
					fs.mkdirSync(path.resolve(destination, entry.path), {
						recursive: true,
					});
				} else {
					fileWriter(
						path.resolve(destination, entry.path),
						entry
					).then((bytesWritten: number) => {
						size = size + bytesWritten;
						if (--entries === 0) resolve(size);
					});
				}
			});
		zipstream.pipe(unzipper);
	});
}

// Use busboy to save incoming files to disk
function saveFiles(
	request: ExpressRequestWithFile,
	_response: Express.Response,
	next: Express.NextFunction
) {
	if (request.method !== 'POST' || !request.headers['content-type']) next();
	else {
		let writer: busboy.Busboy = new busboy({ headers: request.headers });
		writer.on(
			'file',
			(_fieldname, file, filename, _encoding, _mimetype) => {
				request.files = request.files || [];
				let fileObject: file = uniqueName(filename, false);
				request.files.push(fileObject);
				let writeStream: fs.WriteStream = fs.createWriteStream(
					fileObject.path
				);
				writeStream.on('close', () => {
					request.files.find(
						file => file.path === fileObject.path
					).size = writeStream.bytesWritten;
					if (!request.files.filter(file => file.size === -1).length)
						next();
				});
				file.pipe(writeStream);
			}
		);
		writer.on('finish', () => {
			if (!request.files) next();
		});
		request.pipe(writer);
	}
}

// Use busboy to pipe zip files to an unzipper and save as a folder
function saveZips(
	request: ExpressRequestWithFile,
	_response: Express.Response,
	next: Express.NextFunction
) {
	if (request.method !== 'POST' || !request.headers['content-type']) next();
	else {
		let writer = new busboy({ headers: request.headers });
		writer.on('file', (_fieldname, file, filename, _encoding, mimetype) => {
			if (
				mimetype === 'application/zip' ||
				mimetype === 'application/x-zip-compressed'
			) {
				request.files = request.files || [];
				let folderObject = uniqueName(filename, true);
				request.files.push(folderObject);
				extracter(folderObject.path, file).then(size => {
					request.files.find(
						file => file.path === folderObject.path
					).size = size;
					if (!request.files.filter(file => file.size === -1).length)
						next();
				});
			} else file.resume();
		});
		writer.on('finish', () => {
			if (!request.files) next();
		});
		request.pipe(writer);
	}
}

export { saveFiles, saveZips, updateReceivedFiles };
