require('../lib/doge');

var expect = require('chai').expect;

describe('Doge module', function() {
	it('should test this section', function() {
		expect(global.Doge).to.exist;
	});
});
