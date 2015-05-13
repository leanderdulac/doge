require('../../lib/doge');
var Router = require('../../lib/doge/router');

var expect = require('chai').expect;

describe('Router#addRoute', function() {
	it('throws ArgumentErrors when adding a route without path', function() {
		var router = new Router(null);

		expect(function() {
			router.addRoute({
				via: 'GET',
				controller: 'test'
			});
		}).to.throw(ArgumentError);
	});
	
	it('throws ArgumentErrors when adding a route without via', function() {
		var router = new Router(null);

		expect(function() {
			router.addRoute({
				path: 'GET',
				controller: 'test'
			});
		}).to.throw(ArgumentError);
	});
	
	it('add route to route collection with the correct regexp', function() {
		var router = new Router(null);
		router.addRoute({
			path: '/test',
			via: 'GET',
			controller: 'test',
			action: 'index',
		});


		//ensure data on routes
		expect(router.routes).to.have.length.least(1);
		expect(router.routes[0]).to.exists;
		expect(router.routes[0].path).to.be.eql('/test');	
		expect(router.routes[0].method).to.be.eql('GET');
		expect(router.routes[0].regexp.test('/test')).to.be.true;
	});

	it('add route to route collection with the key :name', function() {
		var router = new Router();
		router.addRoute({
			path: '/test/:name', 
			via: 'POST',
			controller: 'test',
			action: 'create'
		});


		expect(router.routes).to.have.length.least(1);
		expect(router.routes[0]).to.exists;
		expect(router.routes[0].path).to.be.eql('/test/:name');
		expect(router.routes[0].keys).to.have.length.least(1);
		expect(router.routes[0].keys[0].name).to.be.eql('name');
		expect(router.routes[0].regexp.test('/test/:name')).to.be.true;

	});

});
