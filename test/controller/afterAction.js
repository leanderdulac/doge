require('../../lib');

var expect = require('chai').expect;

var Controller = require('../../lib/doge/controller.js');

describe('Controller#afterAction', function() {
	it('hook is called after action', function() {

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

		var next = function(){
			return;
		};

		var TestController = new Class('TestController', Controller, function() {
			
			this.afterAction('testHookAfterAction');
			
			this.$.index = function () {
				this.called = true;
				return {
					name: 'Test'
				};
			};

			this.$.testHookAfterAction = function () {
				this.called = false;
			};
		});
		
		var ctrl = new TestController();
		
		return ctrl.call(req, res, next)
		.then(function(){
			expect(res.status).to.be.eql(200);
			expect(ctrl.called).to.be.false;
			expect(res.body.name).to.be.eql('Test');
		});
	});
});
