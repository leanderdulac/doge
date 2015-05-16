require('../../lib');

var expect = require('chai').expect;

var Controller = require('../../lib/doge/controller.js');

describe('Controller#skipBeforeAction', function() {
	it('hook is skipped and before action is not called', function() {

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

			this.skipBeforeAction('testHookBeforeAction');

			this.beforeAction('testHookBeforeAction');
			
			this.$.index = function () {
				return {
					name: 'Test'
				};
			};

			this.$.testHookBeforeAction = function () {
				this.called = true;
			};
		});
		
		var ctrl = new TestController();
		
		return ctrl.call(req, res, next)
		.then(function(){
			expect(res.status).to.be.eql(200);
			expect(ctrl.called).to.not.exist;
			expect(res.body.name).to.be.eql('Test');
		});
	});
});
