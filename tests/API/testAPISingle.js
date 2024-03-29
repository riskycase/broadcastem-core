var chai = require('chai');
var chaiHttp = require('chai-http');
var fs = require('fs');
var path = require('path');

chai.use(chaiHttp);
var should = chai.should();

var upFileSize = fs.statSync('dummy/dummy-up.txt').size;
var downFileSize = fs.statSync('dummy/dummy-down.txt').size;

var app;

function downloadAllTest(done) {
	chai.request(app)
		.get('/download/all')
		.end((err, res) => {
			res.should.have.property('status', 200);
			res.header.should.have.property('content-type', 'application/zip');
			res.header.should.have.property(
				'content-disposition',
				'attachment; filename="allFiles.zip"'
			);
			res.header.should.have.property('transfer-encoding', 'chunked');
			done();
		});
}

function testValidDownload(done, index) {
	chai.request(app)
		.get('/download/specific')
		.query({
			index: index,
		})
		.end((err, res) => {
			res.should.have.property('status', 200);
			res.header.should.have.property(
				'content-length',
				downFileSize.toString()
			);
			res.header.should.have.property(
				'content-type',
				'text/plain; charset=UTF-8'
			);
			res.header.should.have.property(
				'content-disposition',
				'attachment; filename="dummy-down.txt"'
			);
			done();
		});
}

function testInvalidDownload(done, index) {
	chai.request(app)
		.get('/download/specific')
		.query({
			index: index,
		})
		.end((err, res) => {
			res.should.have.property('status', 400);
			res.body.should.be.a('object');
			res.body.should.have.property('status', 400);
			res.body.should.have.property('message', 'Wrong data supplied!');
			done();
		});
}

describe('When sharing a single file', () => {
	before(function (done) {
		if (fs.existsSync('dummy/uploads'))
			fs.rmSync('dummy/uploads', { recursive: true });
		require('../../dist/index')({
			files: ['dummy/dummy-down.txt'],
			destination: 'dummy/uploads',
		}).then(generatedApp => {
			app = generatedApp;
			done();
		});
	});

	it('it should load homepage', done => {
		chai.request(app)
			.get('/')
			.end((err, res) => {
				res.should.have.property('status', 200);
				done();
			});
	});

	it('it should download a zip with name allFiles.zip', downloadAllTest);

	it('it should download the file', done => {
		testValidDownload(done, '0');
	});

	it('it should not download invalid file', done => {
		testInvalidDownload(done, '1');
	});

	it('it should upload a file', done => {
		chai.request(app)
			.post('/upload')
			.set('Content-Type', 'multipart/form-data')
			.attach(
				'files[]',
				fs.readFileSync('dummy/dummy-up.txt'),
				'dummy-up.txt'
			)
			.end((err, res) => {
				res.should.have.property('status', 200);
				res.body.should.be.an('array');
				res.body[0].should.have.property('size', upFileSize);
				res.body[0].should.have.property(
					'sentFileName',
					'dummy-up.txt'
				);
				res.body[0].should.have.property(
					'savedFileName',
					'dummy-up.txt'
				);
				done();
			});
	});

	it('it should not accept empty upload', done => {
		chai.request(app)
			.post('/upload')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property('message', 'Please choose files');
				done();
			});
	});

	it('it should download uploaded file', done => {
		chai.request(app)
			.get('/download/specific')
			.query({
				index: '1',
			})
			.end((err, res) => {
				res.should.have.property('status', 200);
				res.header.should.have.property(
					'content-length',
					upFileSize.toString()
				);
				res.header.should.have.property(
					'content-type',
					'text/plain; charset=UTF-8'
				);
				res.header.should.have.property(
					'content-disposition',
					'attachment; filename="dummy-up.txt"'
				);
				done();
			});
	});

	it('it should not open any download other than shared file', done => {
		testInvalidDownload(done, '2');
	});

	it('it should download multiple files', done => {
		chai.request(app)
			.get('/download/specific')
			.query({
				index: '0,1',
			})
			.end((err, res) => {
				res.should.have.property('status', 200);
				res.header.should.have.property(
					'content-disposition',
					'attachment; filename="variousFiles.zip"'
				);
				res.header.should.have.property(
					'content-type',
					'application/zip'
				);
				res.header.should.have.property('transfer-encoding', 'chunked');
				done();
			});
	});

	it(
		'it should download a zip with name allFiles.zip at the end',
		downloadAllTest
	);

	it('it should upload a zip and extract it', done => {
		chai.request(app)
			.post('/upload/zip')
			.set('Content-Type', 'multipart/form-data')
			.attach(
				'files[]',
				fs.readFileSync('dummy/dummy-zip.zip'),
				'dummy-zip.zip'
			)
			.end((err, res) => {
				res.should.have.property('status', 200);
				res.body.should.be.an('array');
				res.body[0].should.have.property(
					'sentFileName',
					'dummy-zip.zip'
				);
				res.body[0].should.have.property('savedFileName', 'dummy-zip');
				done();
			});
	});
});
