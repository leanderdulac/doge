var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var executables = [
	'bin/doge'
];

exports.loadApplication = function() {
	var originalCwd = process.cwd();

	while (true) {
		var curpath = process.cwd();
		var parsed = path.parse(curpath);

		var executable = _.find(executables, fs.existsSync);

		if (executable) {
			var result = child_process.spawnSync(executable, process.argv.slice(1), {
				stdio: [0,1,2]
			});

			process.exit(result.status);
			break;
		}

		if (parsed.root == parsed.dir) {
			process.chdir(originalCwd);
			break;
		}
		
		process.chdir('..');
	}

	console.log('No doge application found!');
};

