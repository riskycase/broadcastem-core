var chai = require('chai');
var chaiHttp = require('chai-http');
var fs = require('fs');
var path = require('path');

chai.use(chaiHttp);
var should = chai.should();

var upFileSize = fs.statSync('dummy/dummy-up.txt').size;
var downFileSize = fs.statSync('dummy/dummy-down.txt').size;

var app;

describe('When not sharing anything', () => {
	before(function (done) {
		require('../../index')
			.init({
				destination: 'dummy/uploads',
			})
			.then(generatedApp => {
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

	it('it should not open any download', done => {
		chai.request(app)
			.get('/download/all')
			.end((err, res) => {
				res.should.have.property('status', 403);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 403);
				res.body.should.have.property(
					'message',
					'There are no files for download!'
				);
				done();
			});
	});

	it('it should not open any download with data specified', done => {
		chai.request(app)
			.get('/download/specific')
			.query({
				index: '0',
			})
			.end((err, res) => {
				res.should.have.property('status', 403);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 403);
				res.body.should.have.property(
					'message',
					'There are no files for download!'
				);
				done();
			});
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
				res.body[0].should.have.property('name', 'dummy-up.txt');
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
				index: '0',
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
		chai.request(app)
			.get('/download/specific')
			.query({
				index: '1',
			})
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Wrong data supplied!'
				);
				done();
			});
	});

	it('it should download a zip with name allFiles.zip', done => {
		chai.request(app)
			.get('/download/all')
			.end((err, res) => {
				res.should.have.property('status', 200);
				res.header.should.have.property(
					'content-type',
					'application/zip'
				);
				res.header.should.have.property(
					'content-disposition',
					'attachment; filename="allFiles.zip"'
				);
				res.header.should.have.property('transfer-encoding', 'chunked');
				done();
			});
	});
});
