const fileManager = require('./fileManager');
const path = require('path');

// Key-value pairs of icon ids and the extentions that will use these ids
const icons = [
	['image','jpg|jpeg|png|dng|bmp|tiff'],
	['play','mp3|ogg|avi|mp4|flac'],
	['file-text','txt|doc|docx'],
	['pdf','pdf'],
	['file','']
];

/*
 * Forms a row object from file object that will be used by the homepage
 *
 * To be called as a map function
 */
const formRow = (file, index) => ({
	'name': path.basename(file.path),
	'icon': file.folder ? 'folder' : getIcon(path.extname(file.path).substring(path.extname(file.path).indexOf('.') + 1)),
	'size': file.size === undefined ? 'Calculating size' : humanFileSize(file.size),
	'index': index
});

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

/*
 * Determines the icon to be shown from the extention
 *
 * Takes extention and returns id of corresponding icon
 */
const getIcon = ext => icons.find((value) => ext.match(value[1]))[0];

/*
 * Converts bytes to appropriate size with units
 *
 * Takes number of bytes and returns correct number and unit
 */
function humanFileSize(bytes) {
	const thresh = 1024;
	if(Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}
	const units = ['kB','MB','GB','TB','PB','EB','ZB','YB'];
	let u = -1;
	do {
		bytes /= thresh;
		++u;
	}while(Math.abs(bytes) >= thresh);
	return bytes.toFixed(2)+' '+units[u];
}

// Exposes the row generator to be used in homepage
module.exports.getRows = () => fileManager.getFiles().map(formRow);

// Exposes the raw generator to be used in /download/list
module.exports.fileList = () => fileManager.getFiles().map(formRaw);

// Passes on the fil objects as is since they contain the paths
module.exports.getFiles = fileManager.getFiles;
