var path = require('path');
var program = require('commander');
var pkg = require('../../../package');
var Server = require('../server');

program
.command('server')
.alias('s')
.description('start hapidoge server')
.option('-p, --port [port]', 'Runs Hapidoge on the specified port. Default: 3000', 3000)
.option('-b, --binding [IP]', 'Runs Dails on the specified IP. Default: 0.0.0.0', '0.0.0.0')
.option('-e, --environment [environment]', 'Environment to run', 'development')
.action(function(options) {
	if (options.environment) {
		process.env.DOGE_ENV = options.environment;
	}

	var App = require(path.join(process.env.DOGE_ROOT, 'config/application'));

	var server = new Server(App.instance, {
		port: options.port,
		hostname: options.bind
	});

	App.instance.boot()
	.then(function() {
		return server.listen();
	})
	.then(function() {
		var url = 'http://' + options.binding + ':' + options.port;

		if (process.env.DOGE_ENV != 'production') {
			console.log();
			console.log("                        Doge on Rails");
			console.log("                  Y.                      _");
			console.log("                  YiL                   .```.");
			console.log("                  Yii;      WOW       .; .;;`.");
			console.log("                  YY;ii._           .;`.;;;; :");
			console.log("                  iiYYYYYYiiiii;;;;i` ;;::;;;;");
			console.log("              _.;YYYYYYiiiiiiYYYii  .;;.   ;;;");
			console.log("           .YYYYYYYYYYiiYYYYYYYYYYYYii;`  ;;;;");
			console.log("         .YYYYYYY$$YYiiYY$$$$iiiYYYYYY;.ii;`..");
			console.log("        :YYY$!.  TYiiYY$$$$$YYYYYYYiiYYYYiYYii.");
			console.log("        Y$MM$:   :YYYYYY$!\"``\"4YYYYYiiiYYYYiiYY.");
			console.log("     `. :MM$$b.,dYY$$Yii\" :'   :YYYYllYiiYYYiYY");
			console.log("  _.._ :`4MM$!YYYYYYYYYii,.__.diii$$YYYYYYYYYYY");
			console.log("  .,._ $b`P`     \"4$$$$$iiiiiiii$$$$YY$$$$$$YiY;");
			console.log("     `,.`$:       :$$$$$$$$$YYYYY$$$$$$$$$YYiiYYL");
			console.log("      \"`;$$.    .;PPb$`.,.``T$$YY$$$$YYYYYYiiiYYU:");
			console.log("    ' ;$P$;;: ;;;;i$y$\"!Y$$$b;$$$Y$YY$$YYYiiiYYiYY");
			console.log("      $Fi$$ .. ``:iii.`-\";YYYYY$$YY$$$$$YYYiiYiYYY");
			console.log("      :Y$$rb ````  `_..;;i;YYY$YY$$$$$$$YYYYYYYiYY:");
			console.log("       :$$$$$i;;iiiiidYYYYYYYYYY$$$$$$YYYYYYYiiYYYY.");
			console.log("        `$$$$$$$YYYYYYYYYYYYY$$$$$$YYYYYYYYiiiYYYYYY");
			console.log("        .i!$$$$$$YYYYYYYYY$$$$$$YYY$$YYiiiiiiYYYYYYY");
			console.log("       :YYiii$$$$$$$YYYYYYY$$$$YY$$$$YYiiiiiYYYYYYi' cmang");
			console.log();
		}

		console.log('=> Booting Express');
		console.log('=> Doge', pkg.version, 'application starting in', options.environment, 'on', url);
		console.log('=> Run `doge server -h` for more startup options');
		console.log();
	})
	.catch(function(err) {
		console.log('An error ocurred:');
		console.log(err.stack);
	});
});

