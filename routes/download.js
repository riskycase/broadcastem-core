const router = require("express").Router();
const downloadManager = require("../middleware/downloadManager");
const path = require("path");

/* Send a JSON array containing file details in a list */
router.all("/list", (req, res, next) => {
  if (req.method === "GET") {
    // Sends an array of JSON objects
    res.json(downloadManager.fileList());
  } else {
    const error = new Error("Only GET requests are allowed on this route");
    error.status = 400;
    return next(error);
  }
});

/* Download single file */
router.all("/specific", (req, res, next) => {
  if (req.method === "GET") {
    // Gets the index parameter and parses into an array
    const indices = req.query.index ? req.query.index.split(",") : undefined;
    // Gets the list of paths for the files it can send
    const fileArray = downloadManager.getFiles();
    // Ensures that the requested indexes are valid
    if (indices && indices.every((index) => fileArray[index])) {
      // Checks whether file can be sent directly
      if (indices.length === 1 && !fileArray[indices[0]].folder)
        res.download(fileArray[indices[0]].path);
      else {
        // Makes a zip file to send to the client
        const filesJSON = indices.map(function (index) {
          const file = fileArray[index];
          return {
            path: file.path,
            name: path.basename(file.path),
          };
        });
        res.zip({
          files: filesJSON,
          filename:
            indices.length === 1
              ? `${path.basename(fileArray[indices[0]].path)}.zip`
              : "variousFiles.zip",
        });
      }
    }
    // Checks that files are available or not
    else if (fileArray.length === 0) {
      const error = new Error("There are no files for download!");
      error.status = 403;
      return next(error);
    } else {
      const error = new Error("Wrong data supplied!");
      error.status = 400;
      return next(error);
    }
  } else {
    const error = new Error("Only GET requests are allowed on this route");
    error.status = 400;
    return next(error);
  }
});

/* Download all files */
router.all("/all", (req, res, next) => {
  if (req.method === "GET") {
    // Gets all the paths that can be dumped into the zip
    const fileArray = downloadManager.getFiles();
    // Checks that files are available for download
    if (fileArray.length > 0) {
      const filesJSON = fileArray.map(function (file) {
        // Makes an object for each file to dump into the zip
        const name = path.basename(file.path);
        return {
          path: file.path,
          name: name,
        };
      });
      res.zip({
        files: filesJSON,
        filename: "allFiles.zip",
      });
    }
    // Throws error when there are no files present
    else {
      const error = new Error("There are no files for download!");
      error.status = 403;
      return next(error);
    }
  } else {
    const error = new Error("Only GET requests are allowed on this route");
    error.status = 400;
    return next(error);
  }
});

module.exports = router;
