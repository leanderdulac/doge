require('../../lib/doge');

var Router = require('../../lib/doge/router');

var chai = require('chai');

var expect = chai.expect;

chai.use(require('chai-shallow-deep-equal'));

describe('Router#resources', function(){

	it('throws TypeError when adding resources without a string(using number).', function(){
		var router = new Router(null);

		expect(function(){
			router.resources(0);
		}).to.throw(TypeError);
	});

	it('throws TypeError when adding resources without an object options.', function(){
		var router = new Router(null);

		expect(function(){
			router.resources('capture', 'get');
		}).to.throw(TypeError);
	});

	it('throws TypeError when adding resources with both except and only options properties', function(){
		var router = new Router(null);

		expect(function(){
			router.resources('capture', {
				only: ['get', 'destroy'],
				except: ['post', 'put']
			});
		}).to.throw(TypeError);
	});

	it('add simple resource.', function(){
		var router = new Router(null);

		router.resources('capture');

		expect(router.routes).to.have.length.least(5);
		expect(router.routes).to.shallowDeepEqual([{
			method: 'GET',
			path: '/capture',
			defaults: {
				action: 'index',
				controller: 'capture'
			}
		}, 
		{
			method: 'POST',
			path: '/capture',
			defaults: {
				action: 'create',
				controller: 'capture'
			}
		},
		{
			method: 'GET',
			path: '/capture/:id',
			keys: [{
				name: 'id'
			}],
			defaults: {
				action: 'show',
				controller: 'capture'
			}
		},
		{
			method: 'PUT',
			path: '/capture/:id',
			keys: [{
				name: 'id'
			}],
			defaults: {
				action: 'update',
				controller: 'capture'
			}
		},
		{
			method: 'DELETE',
			path: '/capture/:id',
			keys: [{
				name: 'id'
			}],
			defaults: {
				action: 'destroy',
				controller: 'capture'
			}
		}]);
	});

	it('add route using only index', function(){
		var router = Router(null);

		router.resources('capture', {
			only: 'index'
		});

		expect(router.routes).to.have.length.least(1);
		expect(router.routes[0]).to.exists;
		expect(router.routes[0].path).to.be.eql('/capture');
		expect(router.routes[0].method).to.be.eql('GET');
		expect(router.routes[0].defaults.controller).to.be.eql('capture');
		expect(router.routes[0].defaults.action).to.be.eql('index');
		expect(router.routes[0].regexp.test('/capture')).to.be.true;

	});

	it('add route using except show', function(){
		var router = new Router(null);

		router.resources('capture', {
			except: 'show'
		});

		expect(router.routes).to.have.length.least(4);
		expect(router.routes).to.not.shallowDeepEqual({
			method: 'GET',
			path: '/capture/:id',
			keys: [{
				name: 'id'
			}],
			defaults: {
				action: 'show',
				controller: 'capture'
			}
		});
	});

	it('add collection route', function(){
		var router = new Router(null);

		router.resources('capture', {
			only: 'index',
			collection: {
				transaction: 'GET'
			}
		});

		expect(router.routes).to.have.length.least(2);
		expect(router.routes).to.shallowDeepEqual([{
			method: 'GET', 
			path: '/capture',
			defaults: {
				action: 'index',
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

		router.resources('capture', {
			only: 'index',
			member: {
				transaction: 'GET'
			}
		});

		expect(router.routes).to.have.length.least(2);
		expect(router.routes).to.shallowDeepEqual([{
			method: 'GET', 
			path: '/capture',
			defaults: {
				action: 'index',
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
