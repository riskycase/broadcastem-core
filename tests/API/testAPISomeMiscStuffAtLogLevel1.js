var chai = require('chai');
var chaiHttp = require('chai-http');
var fs = require('fs');
var devnull = require('dev-null');

chai.use(chaiHttp);
var should = chai.should();

var app;

describe('Miscalleneous tests - log level 1', () => {
	before(function (done) {
		if (fs.existsSync('dummy/uploads'))
			fs.rmSync('dummy/uploads', { recursive: true });
		require('../../dist/index')({
			files: ['dummy/dummy-folder/dummy-sub/dummy-small.txt'],
			destination: 'dummy/uploads',
			loggingLevel: 1,
			stdout: devnull(),
		}).then(generatedApp => {
			app = generatedApp;
			done();
		});
	});

	it('it should return correct API response', done => {
		chai.request(app)
			.get('/download/list')
			.end((err, res) => {
				res.body.should.be.an('array');
				res.body.length.should.equal(1);
				res.body[0].should.have.property('name', 'dummy-small.txt');
				res.body[0].should.have.property('isFolder', false);
				res.body[0].should.have.property(
					'size',
					fs.statSync('dummy/dummy-folder/dummy-sub/dummy-small.txt')
						.size
				);
				res.body[0].should.have.property('index', 0);
				done();
			});
	});

	it('it should 404 for invalid paths - 1', done => {
		chai.request(app)
			.get('/dgzrt634')
			.end((err, res) => {
				res.should.have.property('status', 404);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 404);
				res.body.should.have.property('message', 'Resource not found');
				done();
			});
	});

	it('it should 404 for invalid paths - 2', done => {
		chai.request(app)
			.post('/sdhxfg')
			.end((err, res) => {
				res.should.have.property('status', 404);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 404);
				res.body.should.have.property('message', 'Resource not found');
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
				res.body[0].should.have.property(
					'size',
					fs.statSync('dummy/dummy-up.txt').size
				);
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
