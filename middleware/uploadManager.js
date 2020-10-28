const busboy = require('busboy');
const unzip = require('unzip-stream');
const fs = require('fs');
const path = require('path');

const fileManager = require('./fileManager');

/*
 * Returns a unique name for the file to prevent overwriting
 *
 * Takes parent directory and name of file/directory, returns a resolved path
 */
function uniqueName(name, folder) {
	const parent = fileManager.destination();
	let number = 0;
	let filename;
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
function fileWriter(filePath, fileStream) {
	return new Promise((resolve, reject) => {
		fs.mkdirSync(path.dirname(filePath), {
			recursive: true,
		});
		const destStream = fs.createWriteStream(filePath).on('close', () => {
			resolve(destStream.bytesWritten);
		});
		fileStream.pipe(destStream);
	});
}

/*
 * Extracts a zip stream to destination directory and returns final size
 *
 * Takes parent directory and zip stream, returns a promise that resolves with
 * the size of the extracted folder
 */
function extracter(destination, zipstream) {
	return new Promise((resolve, reject) => {
		let size = 0;
		let entries = 0;
		const unzipper = unzip
			.Parse()
			.on('error', reject)
			.on('entry', entry => {
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
					).then(bytesWritten => {
						size += bytesWritten;
						if (--entries === 0) resolve(size);
					});
				}
			});
		zipstream.pipe(unzipper);
	});
}

// Use busboy to save incoming files to disk
module.exports.saveFiles = function (req, res, next) {
	if (req.method !== 'POST' || !req.headers['content-type']) next();
	else {
		let writer = new busboy({ headers: req.headers });
		writer.on('file', (fieldname, file, filename, encoding, mimetype) => {
			req.files = req.files || [];
			let fileObject = uniqueName(filename, false);
			req.files.push(fileObject);
			let writeStream = fs.createWriteStream(fileObject.path);
			writeStream.on('close', () => {
				req.files.find(file => file.path === fileObject.path).size =
					writeStream.bytesWritten;
				if (!req.files.filter(file => file.size === -1).length) next();
			});
			file.pipe(writeStream);
		});
		writer.on('finish', () => {
			if (!req.files) next();
		});
		req.pipe(writer);
	}
};

// Use busboy to pipe zip files to an unzipper and save as a folder
module.exports.saveZips = function (req, res, next) {
	if (req.method !== 'POST' || !req.headers['content-type']) next();
	else {
		let writer = new busboy({ headers: req.headers });
		writer.on('file', (fieldname, file, filename, encoding, mimetype) => {
			if (mimetype === 'application/zip') {
				req.files = req.files || [];
				let folderObject = uniqueName(filename, true);
				req.files.push(folderObject);
				extracter(folderObject.path, file).then(size => {
					req.files.find(
						file => file.path === folderObject.path
					).size = size;
					if (!req.files.filter(file => file.size === -1).length)
						next();
				});
			} else file.resume();
		});
		writer.on('finish', () => {
			if (!req.files) next();
		});
		req.pipe(writer);
	}
};

module.exports.updateReceivedFiles = fileManager.updateReceivedFiles;
