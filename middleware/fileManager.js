const fs = require("fs");
const rl = require("readline");
const path = require("path");

const fileHandler = fs.promises;

let directFiles = [];
let listFiles;
let receivedFiles = [];
let destination;

/*
 * Checks if a path is present in an array
 *
 * Takes array of file objects, path and returns truth-y or false-y value
 */
function isPathPresent(arr, path) {
  return arr.find((value) => value.path === path);
}

/*
 * Reads a file line by line, and add the corresponding data to an array
 *
 * Takes path of file and returns promise which resolves when all the specified paths are valid
 */
function readLines(listPath) {
  return new Promise((resolve, reject) => {
    // Opens the list file for reading from it
    const readInterface = rl.createInterface({
      input: fs.createReadStream(listPath),
      console: false,
    });

    // Resolves the promise if the file was read successfully
    readInterface.on("close", resolve);

    let lineNumber = 1;

    readInterface.on("line", (line) => {
      // Processes every line of the file
      if (
        !isPathPresent(directFiles, line) &&
        !isPathPresent(listFiles, line)
      ) {
        // Adds the path to array ony if it exists
        if (fs.existsSync(line)) {
          listFiles.push(fileMaker(line));
          if (lineNumber === 1) calcSize(listFiles);
        }
        // Informs in the error message which path doesn't exist
        else
          reject(
            `${line} does not exist! (at ${path.resolve(
              process.cwd(),
              listPath
            )} at ${lineNumber})`
          );
      }
      lineNumber++;
    });
  });
}

/*
 * Gets the size of the file/folder at given path
 *
 * Takes path and returns promise which when resolved gives the size
 */
function getSize(givenPath) {
  return new Promise((resolve, reject) => {
    fileHandler.stat(givenPath).then((stats) => {
      if (!stats.isDirectory()) setImmediate(resolve, stats.size);
      else
        fileHandler
          .readdir(givenPath)
          .then((children) =>
            children.map((child) => path.resolve(givenPath, child))
          )
          .then((paths) => Promise.all(paths.map(getSize)))
          .then((sizes) =>
            sizes.reduce((total, size) => total + size, stats.size)
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
function calcSize(arr, index = 0) {
  if (arr[index])
    getSize(arr[index].path).then((size) => {
      arr[index].size = size;
      calcSize(arr, ++index);
    });
}

/*
 * Forms a file object from a path
 *
 * Takes path and returns file object
 */
function fileMaker(path) {
  return {
    path: path,
    size: undefined,
    folder: fs.existsSync(path) && fs.statSync(path).isDirectory(),
  };
}

/*
 * Reads all the options and constructs all the file objects accordingly
 *
 * Takes options object and returns promise that resolves when the basic setup is successfully completed
 */
function initFiles(options) {
  // Filters out unique values from the files flag
  directFiles = options.files
    .filter((value, index, self) => self.indexOf(value) === index)
    .map(fileMaker);
  destination = options.destination;

  // Starts calculating the size of all the files in files flag
  calcSize(directFiles);

  // Creates the destination directory if it doesn't exist
  fs.access(destination, fs.constants.F_OK, (err) => {
    if (err) fs.mkdirSync(destination, { recursive: true });
  });

  // Inittialises the array of files specified in a list file
  listFiles = [];

  // Resets the receivedFiles array only if asked to do so
  if (options.restart) receivedFiles = [];

  return new Promise((resolve, reject) => {
    // Reads a list file if it is specified, else resolves immediately
    if (options.list)
      readLines(options.list)
        .then(resolve)
        .catch((err) => reject(err));
    else resolve();
  });
}

// Exports the initialisation function
module.exports.initFiles = initFiles;

// Returns all the file objects as a single array
module.exports.getFiles = () => directFiles.concat(listFiles, receivedFiles);

// Updates the array whenever a new file is successfully sent by a client
module.exports.updateReceivedFiles = function (uploadedFiles) {
  uploadedFiles.forEach(function (value) {
    if (!isPathPresent(receivedFiles, value.path)) {
      receivedFiles.push({ path: value.path, size: value.size, folder: false });
    }
  });
};

// Exposes the upload destination
module.exports.destination = () => destination;
