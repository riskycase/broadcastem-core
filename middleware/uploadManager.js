const multer = require('multer');

const fileManager = require('./fileManager');

// Sets destination for Multer to save files to, and preserve the original name
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, fileManager.destination());
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});

// Creates an instance of Multer with the set options
const upload = multer({ storage: storage });

// Exposes the created Multer instance to the router
module.exports.saveFiles = upload.array('files[]');

module.exports.updateReceivedFiles = fileManager.updateReceivedFiles;
