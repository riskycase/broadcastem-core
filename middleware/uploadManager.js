const busboy = require('busboy');
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

module.exports.updateReceivedFiles = fileManager.updateReceivedFiles;
