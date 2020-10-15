const multer = require('multer');
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

// Exposes the created Multer instance to the router
module.exports.saveFiles = upload.array('files[]');

module.exports.updateReceivedFiles = fileManager.updateReceivedFiles;
