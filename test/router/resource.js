require('../../lib/doge');

var Router = require('../../lib/doge/router');

var chai = require('chai');

var expect = chai.expect;

chai.use(require('chai-shallow-deep-equal'));

describe('Router#resource', function(){

	it('throws TypeError when adding resources without a string(using number).', function(){
		var router = new Router(null);

		expect(function(){
			router.resource(0);
		}).to.throw(TypeError);
	});

	it('throws TypeError when adding resources without an object options.', function(){
		var router = new Router(null);

		expect(function(){
			router.resource('capture', 'get');
		}).to.throw(TypeError);
	});

	it('throws TypeError when adding resources with both except and only options properties', function(){
		var router = new Router(null);

		expect(function(){
			router.resource('capture', {
				only: ['get', 'destroy'],
				except: ['post', 'put']
			});
		}).to.throw(TypeError);
	});

	it('add simple resource.', function(){
		var router = new Router(null);

		router.resource('capture');

		expect(router.routes).to.have.length.least(4);
		expect(router.routes).to.shallowDeepEqual([{
			method: 'POST',
			path: '/capture',
			defaults: {
				action: 'create',
				controller: 'capture'
			}
		},
		{
			method: 'GET',
			path: '/capture',
			defaults: {
				action: 'show',
				controller: 'capture'
			}
		},
		{
			method: 'PUT',
			path: '/capture',
			defaults: {
				action: 'update',
				controller: 'capture'
			}
		},
		{
			method: 'DELETE',
			path: '/capture',
			defaults: {
				action: 'destroy',
				controller: 'capture'
			}
		}]);
	});

	it('add route using only show', function(){
		var router = Router(null);

		router.resource('capture', {
			only: 'show'
		});

		expect(router.routes).to.have.length.least(1);
		expect(router.routes[0]).to.exists;
		expect(router.routes[0].path).to.be.eql('/capture');
		expect(router.routes[0].method).to.be.eql('GET');
		expect(router.routes[0].defaults.controller).to.be.eql('capture');
		expect(router.routes[0].defaults.action).to.be.eql('show');
		expect(router.routes[0].regexp.test('/capture')).to.be.true;

	});

	it('add route using except show', function(){
		var router = new Router(null);

		router.resource('capture', {
			except: 'show'
		});

		expect(router.routes).to.have.length.least(3);
		expect(router.routes).to.not.shallowDeepEqual({
			method: 'GET',
			path: '/capture',
			defaults: {
				action: 'show',
				controller: 'capture'
			}
		});
	});

	it('add collection route', function(){
		var router = new Router(null);

		router.resource('capture', {
			only: 'show',
			collection: {
				transaction: 'GET'
			}
		});

		expect(router.routes).to.have.length.least(2);
		expect(router.routes).to.shallowDeepEqual([{
			method: 'GET', 
			path: '/capture',
			defaults: {
				action: 'show',
				controller: 'capture'
			}
		},
		{
			method: 'GET',
			path: '/capture/transaction',
			defaults: {
				action: 'transaction',
				controller: 'capture'
			}
		}]);
	});

	it('add member route', function(){
		var router = new Router(null);

		router.resource('capture', {
			only: 'show',
			member: {
				transaction: 'GET'
			}
		});

		expect(router.routes).to.have.length.least(2);
		expect(router.routes).to.shallowDeepEqual([{
			method: 'GET', 
			path: '/capture',
			defaults: {
				action: 'show',
				controller: 'capture'
			}
		},
		{
			method: 'GET',
			path: '/capture/:id/transaction',
			defaults: {
				action: 'transaction',
				controller: 'capture'
			},
			keys: [{
				name: 'id'
			}]
		}]);
	});


});
