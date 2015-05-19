require('../../lib/doge');

var Promise = require('bluebird');

var Runtime = require('../../lib/doge/middlewares/runtime');
var Response = require('../../lib/doge/response');

var expect = require('chai').expect;

describe('Middlewares#Runtime', function(){
	it('resolve request and get the runtime', function(){
		var runtime = new Runtime();
		
		var res = new Response({});

		var next = function(){
			return Promise.resolve();
		};

		return runtime.call({}, res, next)
		.then(function(){
			expect(res.headers).to.have.property('X-Runtime');
			expect(res.headers['X-Runtime']).to.not.be.null;
		});
	});
});
