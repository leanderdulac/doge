test:

	@NODE_ENV=test npm test

docs:

	jsdoc -d ./docs -R ./README.md -r ./lib

.PHONY: test
