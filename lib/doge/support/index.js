var _ = require('lodash');

exports.extractOptions = function() {
	var args = [], opts = {};
	var values = _(arguments)
		.toArray()
		.flatten()
		.value();

	for (var i = 0; i < values.length; i++) {
		var value = values[i];

		if (_.isObject(value)) {
			opts = _.merge(opts, value);
		} else {
			args.push(value);
		}
	}

	args.push(opts);

	return args;
};

