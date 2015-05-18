require('../lib/doge');

var expect = require('chai').expect;
var Initializable = require('../lib/doge/initializable');

var TestClass = Class('TestClass', function() {
	this.include(Initializable);

	this.$.initialize = function() {
		this.counter = 0;
	};

	this.initializer('a', function() {
		this.a = this.counter++;
	});

	this.initializer('b', { before: 'c' }, function() {
		this.b = this.counter++;
	});

	this.initializer('c', { after: 'a' }, function() {
		this.c = this.counter++;
	});

	this.initializer('parameter', function(arg) {
		this.arg = arg;
	});
});

var TestSubclass = Class('TestSubclass', TestClass, function() {
	this.initializer('sub', { before: 'c', after: 'b' }, function() {
		this.sub = this.counter++;
	});
});

describe('Initializable#runInitializers', function() {
	it('runs initializers in the correct order', function() {
		var test = new TestClass();

		return test.runInitializers()
		.then(function() {
			expect(test.a).to.be.equal(0);
			expect(test.b).to.be.equal(1);
			expect(test.c).to.be.equal(2);
		});
	});

	it('runs initializers with the correct parameters', function() {
		var test = new TestClass();

		return test.runInitializers('lol')
		.then(function() {
			expect(test.arg).to.be.equal('lol');
		});
	});

	it('should account parent classes initializers', function() {
		var test = new TestSubclass();

		return test.runInitializers()
		.then(function() {
			expect(test.a).to.be.equal(0);
			expect(test.b).to.be.equal(1);
			expect(test.sub).to.be.equal(2);
			expect(test.c).to.be.equal(3);
		});
	});
});

describe('Initializable#initializers', function() {
	it('returns all initializers', function() {
		var test = new TestClass();
	
		expect(test.initializers).to.shallowDeepEqual([{
			name: 'a'
		}, {
			name: 'b'
		}, {
			name: 'c'
		}]);
	});
});

