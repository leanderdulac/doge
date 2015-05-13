require('../../lib/doge');
var Router = require('../../lib/doge/router');

var expect = require('chai').expect;

describe('Router#addRoutes', function() {

	it('add routes to routes collection using string', function() {
		var router = new Router(null);
		router.addRoutes({
			capture:  'POST',
			transaction: 'GET'
		}, {
			controller: 'test',
			path: '/test',
		});

		//ensure data on routes
		expect(router.routes).to.have.length.least(2);
		expect(router.routes[0]).to.exists;
		expect(router.routes[0].path).to.be.eql('/test/capture');	
		expect(router.routes[0].defaults.controller).to.be.eql('test');
		expect(router.routes[0].defaults.action).to.be.eql('capture');
		expect(router.routes[0].method).to.be.eql('POST');
		expect(router.routes[0].regexp.test('/test/capture')).to.be.true;
		expect(router.routes[1]).to.exists;
		expect(router.routes[1].path).to.be.eql('/test/transaction');	
		expect(router.routes[1].defaults.controller).to.be.eql('test');
		expect(router.routes[1].defaults.action).to.be.eql('transaction');
		expect(router.routes[1].method).to.be.eql('GET');
		expect(router.routes[1].regexp.test('/test/transaction')).to.be.true;
	});

	it('add route to routes collection using object', function(){
		var router = new Router(null);
		router.addRoutes({
			capture: {
				path: '/tests/capture',
				controller: 'tests',
				via: 'POST'

			},
		  	transaction: {
				path: '/tests/transaction',
				controller: 'tests',
				via: 'GET'
			}	
		}, {
			controller: 'test',
		});

		expect(router.routes).to.have.length.least(2);
		expect(router.routes[0]).to.exists;
		expect(router.routes[0].path).to.be.eql('/tests/capture');	
		expect(router.routes[0].defaults.controller).to.be.eql('tests');
		expect(router.routes[0].defaults.action).to.be.eql('capture');
		expect(router.routes[0].method).to.be.eql('POST');
		expect(router.routes[0].regexp.test('/tests/capture')).to.be.true;
		expect(router.routes[1]).to.exists;
		expect(router.routes[1].path).to.be.eql('/tests/transaction');	
		expect(router.routes[1].defaults.controller).to.be.eql('tests');
		expect(router.routes[1].defaults.action).to.be.eql('transaction');
		expect(router.routes[1].method).to.be.eql('GET');
		expect(router.routes[1].regexp.test('/tests/transaction')).to.be.true;
	});
/*	it('add route to route collection with the key :name', function() {
		var router = new Router();
		router.addRoutes([{
			path: '/test/:name', 
			via: 'POST',
			controller: 'test',
			action: 'create'
		}]);

		expect(router.routes).to.have.length.least(1);
		expect(router.routes[0]).to.exists;
		expect(router.routes[0].path).to.be.eql('/test/:name');
		expect(router.routes[0].keys).to.have.length.least(1);
		expect(router.routes[0].keys[0].name).to.be.eql('name');
		expect(router.routes[0].regexp.test('/test/:name')).to.be.true;

	}); */

});
