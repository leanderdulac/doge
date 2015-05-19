require('../../lib/doge');

var Promise = require('bluebird');

var Cors = require('../../lib/doge/middlewares/cors');
var Request = require('../../lib/doge/request');
var Response = require('../../lib/doge/response');

var expect = require('chai').expect;

describe('Middlewares#Cors', function(){
	it('resolve request with original cors headers', function(){
		var cors = new Cors();

		var raw = {
			headers: {
				'content-type': 'application/json',
				'access-control-request-methods': 'GET,POST,PUT,DELETE,OPTIONS',
				'access-control-request-headers': 'Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override'
			},
			method: 'GET',
			url: 'http://pagar.me/test'
		};
		var req = new Request(raw);
		var res = new Response({});
		var next = function(){
			return Promise.resolve();
		}

		return cors.call(req, res, next)
		.then(function(){
			expect(res.headers).to.have.property('Access-Control-Allow-Origin', '*');
			expect(res.headers).to.have.property('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
			expect(res.headers).to.have.property('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override');
			expect(res.headers).to.have.property('Access-Control-Allow-Credentials', 'true');
		});
	});

	it('resolve request using method OPTIONS', function(){
		var cors = new Cors();

		var raw = {
			headers: {
				'content-type': 'application/json'
			},
			method: 'OPTIONS',
			url: 'http://pagar.me/test'
		};

		var req = new Request(raw);
		var res = new Response({
			writeHead: function(){ return; },
			write: function(){},
			end: function(done){ 
				return done(); 
			}
		});

		var next = function(){}

		return Promise.resolve(cors.call(req, res, next))
		.then(function(){
			expect(res.headers).to.have.property('Access-Control-Allow-Origin', '*');
			expect(res.headers).to.have.property('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
			expect(res.headers).to.have.property('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override');
			expect(res.headers).to.have.property('Access-Control-Allow-Credentials', 'true');
		});
	});
});
