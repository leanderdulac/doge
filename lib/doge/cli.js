var program = require('commander');
var pkg = require('../../package');

// If we were not invoked by the application itself, find it
if (!process.env.IN_DOGE) {
	require('./app-loader').loadApplication();
}

// Set application root
process.env.DOGE_ROOT = process.cwd();

// Set default options
program
.version(pkg.version);

require('./commands/server');
require('./commands/console');

// Server

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}

