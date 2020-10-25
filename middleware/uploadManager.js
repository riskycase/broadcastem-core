const multer = require('multer');
const busboy = require('busboy');
const fs = require('fs');
const path = require('path');

const fileManager = require('./fileManager');

// Sets destination for Multer to save files to, and preserve the original name
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, fileManager.destination());
	},
	filename: function (req, file, cb) {
		const dest = fileManager.destination();
		let number = 0;
		let name;
		do {
			name = `${path.basename(
				file.originalname,
				path.extname(file.originalname)
			)}${number-- || ''}${path.extname(file.originalname)}`;
		} while (fs.existsSync(path.resolve(dest, name)));
		cb(null, name);
	},
});

// Creates an instance of Multer with the set options
const upload = multer({ storage: storage });

// Use busboy to save incoming files to disk
module.exports.saveFiles2 = function (req, res, next) {
	if (req.method !== 'POST') return next();
	let writer = new busboy({ headers: req.headers });
	req.files = [];
	writer.on('file', (fieldname, file, filename, encoding, mimetype) => {
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
	req.pipe(writer);
};

// Exposes the created Multer instance to the router
module.exports.saveFiles = upload.array('files[]');

module.exports.updateReceivedFiles = fileManager.updateReceivedFiles;
