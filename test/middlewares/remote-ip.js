require('../../lib/doge');

var Promise = require('bluebird');

var RemoteIp = require('../../lib/doge/middlewares/remote-ip');
var Request = require('../../lib/doge/request');

var expect = require('chai').expect;

describe('Middlewares#RemoteIp', function(){
	it('resolve untrusted remote-ip', function(){
		var remoteIp = new RemoteIp('loopback');
		var req = new Request({
			headers: {
				'content-type': 'application/json',
				'x-forwarded-for': '127.0.0.1'
			},
			connection: {
				remoteAddress: '127.0.0.1'
			},
			url: 'http://pagar.me'		
		});
		var next = function(){
			return Promise.resolve();
		}
		
		
		return remoteIp.call(req, {}, next)
		.then(function(){
			expect(req.remoteIps).to.be.an.array;
			expect(req.remoteIps).to.have.length.least(2);
			expect(req.remoteIp).to.be.eql('127.0.0.1');
		});	
	});
});
