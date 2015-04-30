var _ = require('lodash');

module.exports = new Module('Params', function() {
	this.defineGetter('params', function() {
		if (!this._params) {
			this._params = _.merge(this.request.requestParameters, this.request.queryParameters, this.request.pathParameters);
		}

		return this._params;
	});
});

