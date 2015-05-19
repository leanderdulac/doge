require('../../lib/doge');

var Promise = require('bluebird');

var MethodOverride = require('../../lib/doge/middlewares/method-override');
var Request = require('../../lib/doge/request');

var expect = require('chai').expect;

describe('Middlewares#Method-Override', function(){
	it('resolve request set method override', function(){
		var methodOverride = new MethodOverride();
		var req = new Request({
			headers: {
				'content-type': 'application/json',
				'x-http-method-override': 'POST' 
			},
			method: 'GET',
			url: 'http://pagar.me/test'
		});
		var next = function(){
			return Promise.resolve();
		};

		return methodOverride.call(req, {}, next)
		.then(function(){
			expect(req.method).to.be.eql('POST');
		});
	});

	it('resolve request no change method', function(){
		var methodOverride = new MethodOverride();
		var req = new Request({
			headers: {
				'content-type': 'application/json'
			},
			method: 'GET',
			url: 'http://pagar.me/test'
		});
		var next = function(){
			return Promise.resolve();
		};

		return methodOverride.call(req, {}, next)
		.then(function(){
			expect(req.method).to.be.eql('GET');
		});

	
	});
});
