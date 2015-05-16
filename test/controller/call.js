require('../../lib');

var expect = require('chai').expect;

var Controller = require('../../lib/doge/controller.js');

describe('Controller#call', function() {
	it('throws the controller when not have a action parameter', function() {

		var req = {
			method: 'GET',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json',
				host: 'localhost'
			},
			uri: {
				host: 'localhost',
				pathname: '/'
			},
			queryParameters: {
				name: 'Test',
				value: 'Testing'
			},
			pathParameters: {}
		};

		var res = {};

		var next = function(){
			return;
		};

		var TestController = new Class('TestController', Controller, function() {});
		
		var ctrl = new TestController();
		
		return ctrl.call(req, res, next)
		.then(function(){
			expect(res.status).to.be.eql(500);
			expect(res.body.error).to.be.eql('internal_error');
			expect(res.body.message).to.be.eql('An internal error ocurred.');
		});
	});

	it('throws the controller when not have a action in the class', function() {

		var req = {
			method: 'GET',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json',
				host: 'localhost'
			},
			uri: {
				host: 'localhost',
				pathname: '/'
			},
			queryParameters: {
				name: 'Test',
				value: 'Testing'
			},
			pathParameters: {
				action: 'index'
			}
		};

		var res = {};

		var next = function() {
			return;
		};

		var TestController = new Class('TestController', Controller, function() {});
		
		var ctrl = new TestController();
		
		return ctrl.call(req, res, next)
		.then(function(){
			expect(res.status).to.be.eql(500);
			expect(res.body.error).to.be.eql('internal_error');
			expect(res.body.message).to.be.eql('An internal error ocurred.');
		});
	});

	it('invokes the controller action correctly', function() {

		var req = {
			method: 'GET',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json',
				host: 'localhost'
			},
			uri: {
				host: 'localhost',
				pathname: '/'
			},
			queryParameters: {
				name: 'Test',
				value: 'Testing'
			},
			pathParameters: {
				action: 'index'
			}
		};

		var res = {
			status: 200
		};

		var next = function() {
			return;
		};

		var TestController = new Class('TestController', Controller, function() {
			this.$.index= function () {
				return {
					name: 'Test'
				};
			};
		});
		
		var ctrl = new TestController();
		
		return ctrl.call(req, res, next)
		.then(function(){
			expect(res.status).to.be.eql(200);
			expect(res.body.name).to.be.eql('Test');
		});
	});
});

