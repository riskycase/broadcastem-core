const Mocha = require('mocha');
const fs = require('fs').promises;
const path = require('path');

const mocha = new Mocha();

fs.readdir(__dirname)
	.then(files => files.filter(file => file.substring(0, 7) === 'testAPI'))
	.then(files => files.map(file => path.join(__dirname, file)))
	.then(files => files.forEach(file => mocha.addFile(file)))
	.then(() => mocha.run(failures => (process.exitCode = failures)));
