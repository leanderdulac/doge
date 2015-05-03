var _ = require('lodash');
var Joi = require('joi');

global.ControllerValidationError = new Class('ControllerValidationError', StandardError, function() {
	this.$.initialize = function(errors) {
		this.errors = errors;
	};
});

module.exports = new Module('Validation', function() {
	this.metaclass.$.included = function(base) {
		base.rescueFrom(ControllerValidationError, function(err) {
			return this.renderError(_.map(err.errors.details, function(err) {
				return {
					parameter_name: err.path,
					message: err.message,
					type: 'invalid_parameterer'
				};
			}), { status: 400 });
		});
	};
	
	this.$.validate = function(schema) {
		var object = Joi.validate(this.params, schema, {
			abortEarly: false,
			stripUnknown: true
		});

		if (object.error) {
			throw new ControllerValidationError(object.error);
		}

		return object.value;
	};
});

