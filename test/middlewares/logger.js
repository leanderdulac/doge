require('../../lib/doge');

var Promise = require('bluebird');
var log4js = require('log4js');

var Logger = require('../../lib/doge/middlewares/logger');
var Request = require('../../lib/doge/request');
var Response = require('../../lib/doge/response');

var expect = require('chai').expect;

describe('Middlewares#Logger', function(){
	it('resolve log message on request', function(){
		var logger = new Logger();
		var logs = {};
		logger.logger.on('log', function(log){
			logs = log;
		});

		var req = new Request({
			headers: {
				'content-type': 'application/json'
			},
			method: 'GET',
			url: 'http://pagar.me/test'
		});

		req.remoteIp = '127.0.0.1';
		var res = new Response({});

		var next = function(){
			return Promise.resolve();
		};

		return logger.call(req, res, next)
		.then(function(){
			expect(logs.data).to.have.length.least(5);
			expect(logs.data).to.include('GET');
			expect(logs.data).to.include('/test');
			expect(logs.data).to.include(200);
			expect(logs.data).to.include('127.0.0.1');
		});

	});

});
