require('../lib');

var expect = require('chai').expect;

describe('Doge module', function() {
	it('test if Doge as defined in global scope', function() {
		expect(global.Doge).to.exist;
	});
});
