import fs from 'fs';
import rl from 'readline';
import path from 'path';

const fileHandler = fs.promises;

let directFiles: Array<file> = [];
let listFiles: Array<file>;
let receivedFiles: Array<file> = [];
let destination: string;

/*
 * Checks if a path is present in an array
 *
 * Takes array of file objects, path and returns truth-y or false-y value
 */
function isPathPresent(arr: Array<file>, path: string) {
	return arr.find(value => value.path === path);
}

/*
 * Adds a path to listFiles if not already present in it or directFiles
 *
 * Takes path of file and returns nothing
 */
function addPath(path: string): void {
	if (!isPathPresent(directFiles, path) && !isPathPresent(listFiles, path))
		listFiles.push(fileMaker(path));
}

/*
 * Reads a file line by line, and add the corresponding data to an array
 *
 * Takes path of file and returns promise which resolves when all the specified paths are valid
 */
function readLines(listPath: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		// Opens the list file for reading from it
		const readInterface: rl.Interface = rl.createInterface({
			input: fs.createReadStream(listPath),
			terminal: false,
		});

		// Resolves the promise if the file was read successfully
		readInterface.on('close', () => {
			resolve();
			calcSize(listFiles);
		});

		let lineNumber: number = 1;

		readInterface.on('line', line => {
			if (fs.existsSync(line)) addPath(line);
			else
				reject(
					`${line} does not exist! (at ${path.resolve(
						process.cwd(),
						listPath
					)} at ${lineNumber})`
				);
			lineNumber++;
		});
	});
}

/*
 * Gets the size of the file/folder at given path
 *
 * Takes path and returns promise which when resolved gives the size
 */
function getSize(givenPath: string): Promise<number> {
	return new Promise((resolve, reject) => {
		fileHandler.stat(givenPath).then(stats => {
			if (!stats.isDirectory()) setImmediate(resolve, stats.size);
			else
				fileHandler
					.readdir(givenPath)
					.then(children =>
						children.map(child => path.resolve(givenPath, child))
					)
					.then(paths => Promise.all(paths.map(getSize)))
					.then(sizes =>
						sizes.reduce(
							(total: number, size: number) => total + size,
							stats.size
						)
					)
					.then(resolve);
		});
	});
}

/*
 * Calls the getSize funtion once for every element in array, calling only when all the previous elements have resolved
 *
 * Takes array and index, however index is only used internally and does not return anything
 */
function calcSize(arr: Array<file>, index: number = 0) {
	if (arr[index])
		getSize(arr[index].path).then(size => {
			arr[index].size = size;
			calcSize(arr, ++index);
		});
}

/*
 * Forms a file object from a path
 *
 * Takes path and returns file object
 */
function fileMaker(filePath: string): file {
	return {
		path: filePath,
		size: undefined,
		folder: fs.existsSync(filePath) && fs.statSync(filePath).isDirectory(),
		originalname: path.basename(filePath),
		filename: path.basename(filePath),
	};
}

/*
 * Reads all the options and constructs all the file objects accordingly
 *
 * Takes options object and returns promise that resolves when the basic setup is successfully completed
 */
function initFiles(options: options): Promise<void> {
	// Set files to empty array if not defined
	if (!Array.isArray(options.files)) options.files = [];

	// Filters out unique values from the files flag
	directFiles = options.files
		.filter((value, index, self) => self.indexOf(value) === index)
		.map(fileMaker);
	destination =
		options.destination ||
		path.resolve(path.basename(require.main.filename), '../uploads');

	// Starts calculating the size of all the files in files flag
	calcSize(directFiles);

	// Creates the destination directory if it doesn't exist
	fs.access(destination, fs.constants.F_OK, err => {
		if (err) fs.mkdirSync(destination, { recursive: true });
	});

	// Inittialises the array of files specified in a list file
	listFiles = [];

	// Resets the receivedFiles array only if asked to do so
	if (options.restart) receivedFiles = [];
	return new Promise<void>((resolve, reject) => {
		// Reads a list file if it is specified, else resolves immediately
		if (options.list)
			readLines(options.list)
				.then(resolve)
				.catch(err => reject(err));
		else resolve();
	});
}

// Returns all the file objects as a single array
function getFiles(): Array<file> {
	return directFiles.concat(listFiles, receivedFiles);
}
// Updates the array whenever a new file is successfully sent by a client
function updateReceivedFiles(uploadedFiles: Array<file>): void {
	uploadedFiles.forEach(function (value) {
		if (!isPathPresent(receivedFiles, value.path)) {
			receivedFiles.push(value);
		}
	});
}

export { initFiles, getFiles, destination, updateReceivedFiles };
