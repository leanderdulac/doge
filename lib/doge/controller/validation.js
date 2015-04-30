var Joi = require('joi');

module.exports = new Module('Validation', function() {
	this.$.validate = function(schema) {
		var object = Joi.validate(this.params, schema, {
			abortEarly: false,
			stripUnkown: true,
		});

		if (object.error) {
			throw new Error('Validate Error');
		}

		return object.value;
	};
});

