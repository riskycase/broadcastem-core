var chai = require('chai');
var chaiHttp = require('chai-http');
var fs = require('fs');
var path = require('path');

chai.use(chaiHttp);
var should = chai.should();

var app;

describe('Testing for correctness of response', () => {
	before(function (done) {
		fs.rmdirSync('dummy/uploads', { recursive: true });
		require('../../dist/index')({
			files: ['dummy/dummy-folder/dummy-sub/dummy-small.txt'],
			destination: 'dummy/uploads',
		}).then(generatedApp => {
			app = generatedApp;
			done();
		});
	});

	it('it should only accept GET for /', done => {
		chai.request(app)
			.get('/')
			.end((err, res) => {
				res.should.have.property('status', 200);
				done();
			});
	});

	it('it should not accept POST for /', done => {
		chai.request(app)
			.post('/')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept HEAD for /', done => {
		chai.request(app)
			.head('/')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('string');
				res.body.should.be.equal('');
				done();
			});
	});

	it('it should not accept PUT for /', done => {
		chai.request(app)
			.put('/')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept DELETE for /', done => {
		chai.request(app)
			.delete('/')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});

	it('it should only accept POST for /upload with data supplied', done => {
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

	it('it should not accept POST for /upload without any files attatched', done => {
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

	it('it should not accept GET for /upload', done => {
		chai.request(app)
			.get('/upload')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only POST requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept HEAD for /upload', done => {
		chai.request(app)
			.head('/upload')
			.end((err, res) => {
				res.should.have.property('status', 400);
				done();
			});
	});

	it('it should not accept PUT for /upload', done => {
		chai.request(app)
			.put('/upload')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only POST requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept DELETE for /upload', done => {
		chai.request(app)
			.delete('/upload')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only POST requests are allowed on this route'
				);
				done();
			});
	});

	it('it should only accept POST for /upload/zip with zip file supplied', done => {
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

	it('it should not accept POST for /upload/zip without any zip files attatched', done => {
		chai.request(app)
			.post('/upload/zip')
			.set('Content-Type', 'multipart/form-data')
			.attach(
				'files[]',
				fs.readFileSync('dummy/dummy-up.txt'),
				'dummy-up.text'
			)
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property('message', 'Please choose files');
				done();
			});
	});

	it('it should not accept POST for /upload/zip without any files attatched', done => {
		chai.request(app)
			.post('/upload/zip')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property('message', 'Please choose files');
				done();
			});
	});

	it('it should not accept GET for /upload/zip', done => {
		chai.request(app)
			.get('/upload/zip')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only POST requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept HEAD for /upload/zip', done => {
		chai.request(app)
			.head('/upload/zip')
			.end((err, res) => {
				res.should.have.property('status', 400);
				done();
			});
	});

	it('it should not accept PUT for /upload/zip', done => {
		chai.request(app)
			.put('/upload/zip')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only POST requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept DELETE for /upload/zip', done => {
		chai.request(app)
			.delete('/upload/zip')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only POST requests are allowed on this route'
				);
				done();
			});
	});

	it('it should only accept GET for /download/list', done => {
		chai.request(app)
			.get('/download/list')
			.end((err, res) => {
				res.should.have.property('status', 200);
				done();
			});
	});

	it('it should not accept POST for /download/list', done => {
		chai.request(app)
			.post('/download/list')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept HEAD for /download/list', done => {
		chai.request(app)
			.head('/download/list')
			.end((err, res) => {
				res.should.have.property('status', 400);
				done();
			});
	});

	it('it should not accept PUT for /download/list', done => {
		chai.request(app)
			.put('/download/list')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept DELETE for /download/list', done => {
		chai.request(app)
			.delete('/download/list')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});

	it('it should only accept GET for /download/specific when data is added', done => {
		chai.request(app)
			.get('/download/specific')
			.query({
				index: 0,
			})
			.end((err, res) => {
				res.should.have.property('status', 200);
				done();
			});
	});

	it('it should not accept GET for /download/specific correct data is not present', done => {
		chai.request(app)
			.get('/download/specific')
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

	it('it should not accept POST for /download/specific', done => {
		chai.request(app)
			.post('/download/specific')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept HEAD for /download/specific', done => {
		chai.request(app)
			.head('/download/specific')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('string');
				res.body.should.be.equal('');
				done();
			});
	});

	it('it should not accept PUT for /download/specific', done => {
		chai.request(app)
			.put('/download/specific')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept DELETE for /download/specific', done => {
		chai.request(app)
			.delete('/download/specific')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});

	it('it should only accept GET for /download/all', done => {
		chai.request(app)
			.get('/download/all')
			.end((err, res) => {
				res.should.have.property('status', 200);
				done();
			});
	});

	it('it should not accept POST for /download/all', done => {
		chai.request(app)
			.post('/download/all')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept HEAD for /download/all', done => {
		chai.request(app)
			.head('/download/all')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('string');
				res.body.should.be.equal('');
				done();
			});
	});

	it('it should not accept PUT for /download/all', done => {
		chai.request(app)
			.put('/download/all')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});

	it('it should not accept DELETE for /download/all', done => {
		chai.request(app)
			.delete('/download/all')
			.end((err, res) => {
				res.should.have.property('status', 400);
				res.body.should.be.a('object');
				res.body.should.have.property('status', 400);
				res.body.should.have.property(
					'message',
					'Only GET requests are allowed on this route'
				);
				done();
			});
	});
});
