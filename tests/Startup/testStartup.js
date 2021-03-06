var chai = require('chai');

const should = chai.should();
const app = require('../../dist/index');

describe('When trying to start the app', () => {
	it('it should resolve only when all paths supplied in the list are existent', done => {
		app({
			destination: 'dummy/uploads',
			list: 'dummy/dummy-list-long.txt',
			stdout: process.stdout,
		})
			.then(app => {
				done();
			})
			.catch(err => {
				throw new Error(err);
			});
	});

	it('it should reject when a path is invalid', done => {
		app({
			destination: 'dummy/uploads',
			list: 'dummy/dummy-list-invalid.txt',
		}).catch(err => {
			/dummy[/\\]I[/\\]dont[/\\]exist does not exist! \(at .*dummy[/\\]dummy-list-invalid.txt at 3\)/
				.test(err)
				.should.equal(true);
			done();
		});
	});

	it('it should reject when a path is invalid even in a long list', done => {
		app({
			destination: 'dummy/uploads',
			list: 'dummy/dummy-list-long-invalid.txt',
		}).catch(err => {
			/dummy[/\\]doesnt[/\\]exist does not exist! \(at .*dummy[/\\]dummy-list-long-invalid.txt at 53\)/
				.test(err)
				.should.equal(true);
			done();
		});
	});

	it('it should set logging level to 0 if NaN is detected', done => {
		app({
			loggingLevel: 'sdgztrfjxty',
		}).then(app => done());
	});

	it('it should use default options if nothing is specified', done => {
		app().then(app => done());
	});
});
