require('../../lib/doge');

var EE = require('events').EventEmitter;
var Promise = require('bluebird');
var dogeon = require('dogeon');

var BodyParser = require('../../lib/doge/middlewares/body-parser');
var Request = require('../../lib/doge/request');
var Response = require('../../lib/doge/response');

var expect = require('chai').expect;

describe('Middleware#BodyParser', function(){
	it('resolve request send json', function(){
		var bodyParser = new BodyParser();
		var raw = new EE();
		raw.headers = {
			'content-type': 'application/json'
		};

		raw.url = 'http://pagar.me/test';
		var req = new Request(raw);

		process.nextTick(function(){
			req.raw.emit('data', JSON.stringify({hello: 'world'}));
			req.raw.emit('end');
		});

		var next = function(){
			return Promise.resolve();
		}

		return bodyParser.call(req, {}, next)
		.then(function(){
			expect(req.requestParameters).to.not.be.undefined;
			expect(req.requestParameters).to.not.be.empty;
			expect(req.requestParameters).to.have.property('hello', 'world');
		});
	});

	it('resolve request send dson', function(){
		var bodyParser = new BodyParser();
		var raw = new EE();
		raw.headers = {
			'content-type': 'application/dson'
		};

		raw.url = 'http://pagar.me/test';
		var req = new Request(raw);

		process.nextTick(function(){
			req.raw.emit('data', dogeon.stringify({hello: 'world'}));
			req.raw.emit('end');
		});

		var next = function(){
			return Promise.resolve();
		}

		return bodyParser.call(req, {}, next)
		.then(function(){
			expect(req.requestParameters).to.not.be.undefined;
			expect(req.requestParameters).to.not.be.empty;
			expect(req.requestParameters).to.have.property('hello', 'world');
		});
	});

	it('resolve request send form-urlencoded', function(){
		var bodyParser = new BodyParser();
		var raw = new EE();
		raw.headers = {
			'content-type': 'application/x-www-form-urlencoded'
		};

		raw.url = 'http://pagar.me/test';
		var req = new Request(raw);

		process.nextTick(function(){
			req.raw.emit('data', 'hello=world');
			req.raw.emit('end');
		});

		var next = function(){
			return Promise.resolve();
		}

		return bodyParser.call(req, {}, next)
		.then(function(){
			expect(req.requestParameters).to.not.be.undefined;
			expect(req.requestParameters).to.not.be.empty;
			expect(req.requestParameters).to.have.property('hello', 'world');
		});
	});



});
