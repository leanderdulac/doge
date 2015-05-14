require('../../lib/doge');

var Router = require('../../lib/doge/router');

var expect = require('chai').expect;

describe('Router#call', function(){
	it('throws the route when method doesn\'t match', function(){
		var router = new Router(null);

		router.match('test', 'test#index', { via: 'GET' });

		var res = {};
		var req = {
			method: 'POST',
			url: '/test'
		};

		var next = function(){
			return;
		};

		router.call(req, res, next);

		expect(res.status).to.be.eql(404);
		expect(res.body.url).to.be.eql('/test');
		expect(res.body.method).to.be.eql('POST');
		expect(res.body.errors).to.have.length.least(1);
		expect(res.body.errors[0]).to.exists;
		expect(res.body.errors[0].type).to.be.eql('not_found');
		expect(res.body.errors[0].message).to.be.eql('Route not found.');
	});

	it('throws the route when regex doesn\'t match', function(){
		var router = new Router(null);

		router.match('test', 'test#index', { via: 'GET' });

		var res = {};
		var req = {
			method: 'GET',
			url: '/test0'
		};

		var next = function(){
			return;
		};

		router.call(req, res, next);

		expect(res.status).to.be.eql(404);
		expect(res.body.url).to.be.eql('/test0');
		expect(res.body.method).to.be.eql('GET');
		expect(res.body.errors).to.have.length.least(1);
		expect(res.body.errors[0]).to.exists;
		expect(res.body.errors[0].type).to.be.eql('not_found');
		expect(res.body.errors[0].message).to.be.eql('Route not found.');
	});

	it('throws the route with controller', function(){
		var router = new Router(null);

		router.match('test', 'index', { via: 'GET' });

		var res = {};
		var req = {
			method: 'GET',
			url: '/test'
		};

		var next = function(){
			return;
		};

		expect(function(){
			router.call(req, res, next);
		}).to.throw(RoutingError);

	});

	it('throws the route when controller not found', function(){
		var Ctl = new Class(function() {
			this.$.call = function() {
				res.status = 200;
				res.body = 'ok';
				return;
			};
		});

		var App = new Class(function() {
			this.$.getController = function(name) {
				if(name === 'test'){
					return null;
				}
				return Ctl;
			};
		});

		var app = new App();
		var router = new Router(app);

		router.match('test', 'test#index', { via: 'GET' });

		var res = {};
		var req = {
			method: 'GET',
			url: '/test'
		};

		var next = function(){
			return;
		};

		expect(function(){
			router.call(req, res, next);
		}).to.throw(RoutingError);

	});


	it('responds with invalid route response', function(){
		var router = new Router(null);
		var req = {
			method: 'GET',
			url: '/test'
		};
		var res = {};
		var next = function(){
			return;
		};


		router.call(req, res, next);

		expect(res.status).to.be.eql(404);
		expect(res.body.url).to.be.eql('/test');
		expect(res.body.method).to.be.eql('GET');
		expect(res.body.errors).to.have.length.least(1);
		expect(res.body.errors[0]).to.exists;
		expect(res.body.errors[0].type).to.be.eql('not_found');
		expect(res.body.errors[0].message).to.be.eql('Route not found.');
	});

	it('invokes the controller correctly', function(){
		var Ctl = new Class(function() {
			this.$.call = function() {
				res.status = 200;
				res.body = 'ok';
				return;
			};
		});

		var App = new Class(function() {
			this.$.getController = function(name) {
				return Ctl;
			};
		});

		var app = new App();
		var router = new Router(app);

		router.match('test', 'test#index', { via: 'GET' });

		var res = {};
		var req = {
			method: 'GET',
			url: '/test'
		};

		var next = function(){
			return;
		};

		router.call(req, res, next);
	
		expect(res.status).to.be.eql(200);
		expect(res.body).to.be.eql('ok');

	});

});
