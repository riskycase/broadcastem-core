const fileManager = require('./fileManager');
const path = require('path');

/*
 * Forms a raw object which will be used in /download/list endpoint
 *
 * To be called as a map function
 */
const formRaw = (file, index) => ({
	'name': path.basename(file.path),
	'isFolder': file.folder,
	'size': file.size === undefined ? -1 : file.size,
	'index': index
});

// Exposes the raw generator to be used in /download/list
module.exports.fileList = () => fileManager.getFiles().map(formRaw);

// Passes on the fil objects as is since they contain the paths
module.exports.getFiles = fileManager.getFiles;
