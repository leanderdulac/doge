require('../../lib/doge');

var Router = require('../../lib/doge/router');
var expect = require('chai').expect;

describe('Router#match', function(){
	it('no arguments send', function(){
		var router = new Router(null);

		expect(function(){
			router.match();
		}).to.throw(Error);
	});

	it('match a single route', function(){
		var router = new Router(null);

		router.match('capture');

		expect(router.routes).to.have.length.least(1);
		expect(router.routes[0]).to.exists;
		expect(router.routes[0].path).to.have.be.eql('/capture');
		expect(router.routes[0].method).to.be.eql('ALL');
		expect(router.routes[0].regexp.test('/capture')).to.be.true;
	});

	it('match a single route send string controller and action', function(){
		var router = new Router(null);

		router.match('capture', 'test#index');

		expect(router.routes).to.have.length.least(1);
		expect(router.routes[0]).to.exists;
		expect(router.routes[0].path).to.have.be.eql('/capture');
		expect(router.routes[0].method).to.be.eql('ALL');
		expect(router.routes[0].defaults.controller).to.be.eql('test');
        expect(router.routes[0].defaults.action).to.be.eql('index');	
		expect(router.routes[0].regexp.test('/capture')).to.be.true;

	});

	it('match a single POST route send an object', function(){
		var router = new Router(null);

		router.match('capture', 'test#index', {via: 'POST'});

		expect(router.routes).to.have.length.least(1);
		expect(router.routes[0]).to.exists;
		expect(router.routes[0].path).to.have.be.eql('/capture');
		expect(router.routes[0].method).to.be.eql('POST');
		expect(router.routes[0].defaults.controller).to.be.eql('test');
        expect(router.routes[0].defaults.action).to.be.eql('index');	
		expect(router.routes[0].regexp.test('/capture')).to.be.true;
	});

	it('match only two verb specified in object in routes endpoint', function(){
		var router = new Router(null);

		router.match('capture', {via: ['GET', 'POST']});

		expect(router.routes).to.have.length.least(2);
		expect(router.routes[0]).to.exists;
		expect(router.routes[0].path).to.have.be.eql('/capture');
		expect(router.routes[0].method).to.be.eql('GET');
		expect(router.routes[0].regexp.test('/capture')).to.be.true;
		expect(router.routes[1].path).to.have.be.eql('/capture');
		expect(router.routes[1].method).to.be.eql('POST');
		expect(router.routes[1].regexp.test('/capture')).to.be.true;
	

	});
});
