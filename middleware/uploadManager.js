const busboy = require('busboy');
const unzip = require('unzip-stream');
const fs = require('fs');
const path = require('path');

const fileManager = require('./fileManager');

// Use busboy to save incoming files to disk
module.exports.saveFiles = function (req, res, next) {
	if (req.method !== 'POST' || !req.headers['content-type']) return next();
	let writer = new busboy({ headers: req.headers });
	writer.on('file', (fieldname, file, filename, encoding, mimetype) => {
		req.files = req.files || [];
		const dest = fileManager.destination();
		let number = 0;
		let name;
		do
			name = `${path.basename(filename, path.extname(filename))}${
				number-- || ''
			}${path.extname(filename)}`;
		while (fs.existsSync(path.resolve(dest, name)));
		req.files.push({
			path: path.resolve(dest, name),
			originalname: filename,
			filename: name,
			size: -1,
			folder: false,
		});
		let writeStream = fs.createWriteStream(path.resolve(dest, name));
		writeStream.on('close', () => {
			req.files.find(
				file => file.path === path.resolve(dest, name)
			).size = writeStream.bytesWritten;
			if (!req.files.filter(file => file.size === -1).length) next();
		});
		file.pipe(writeStream);
	});
	writer.on('finish', () => {
		if (!req.files) next();
	});
	req.pipe(writer);
};

// Use busboy to pipe zip files to an unzipper and save as a folder
module.exports.saveZips = function (req, res, next) {
	if (req.method !== 'POST' || !req.headers['content-type']) return next();
	let writer = new busboy({ headers: req.headers });
	writer.on('file', (fieldname, file, filename, encoding, mimetype) => {
		if (mimetype === 'application/zip') {
			req.files = req.files || [];
			let destination;
			let number = 0;
			do
				destination = path.resolve(
					fileManager.destination(),
					`${path.basename(filename, path.extname(filename))}${
						number-- || ''
					}`
				);
			while (fs.existsSync(path.resolve(destination)));
			fs.mkdirSync(destination, { recursive: true });
			req.files.push({
				path: destination,
				originalname: filename,
				filename: path.basename(destination),
				size: -1,
				folder: true,
			});
			let size = 0;
			let entries = 0;
			const unzipper = unzip
				.Parse()
				.on('error', console.error)
				.on('entry', entry => {
					entries++;
					if (entry.type === 'Directory')
						fs.mkdirSync(path.resolve(destination, entry.path), {
							recursive: true,
						});
					else {
						fs.mkdirSync(
							path.dirname(path.resolve(destination, entry.path)),
							{ recursive: true }
						);
						const writeStream = fs
							.createWriteStream(
								path.resolve(destination, entry.path)
							)
							.on('close', () => {
								size += writeStream.bytesWritten;
								if (--entries === 0)
									req.files.find(
										file => file.path === destination
									).size = size;
								if (
									!req.files.filter(file => file.size === -1)
										.length
								)
									next();
							});
						entry.pipe(writeStream);
					}
				});
			file.pipe(unzipper);
		} else file.resume();
	});
	writer.on('finish', () => {
		if (!req.files) next();
	});
	req.pipe(writer);
};

module.exports.updateReceivedFiles = fileManager.updateReceivedFiles;
