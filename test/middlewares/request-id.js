require('../../lib/doge');

var Promise = require('bluebird');

var RequestId = require('../../lib/doge/middlewares/request-id');
var Request = require('../../lib/doge/request');
var Response = require('../../lib/doge/response');

var expect = require('chai').expect;

describe('Middlewares#RequestId', function(){
	it('resolve request and get the request-id', function(){
		var requestId = new RequestId();
			
		var req = new Request({
			headers: {
				'content-type': 'application/json'
			},
			method: 'GET',
			url: 'http://pagar.me/test'
		});
		
		var res = new Response({});
		var next = function(){
			return Promise.resolve();
		}

		return requestId.call(req, res, next)
		.then(function(){
			expect(res.headers).to.have.property('X-Request-Id');
			expect(res.headers['X-Request-Id']).to.be.a('string');
			expect(res.headers['X-Request-Id']).to.not.be.null;
			expect(res.headers['X-Request-Id']).to.not.be.empty;
		});
	});
});
