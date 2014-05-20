'use strict';

var program = require('commander');
var NpmStrategy = require('./lib/npm/strategy');
var BowerStrategy = require('./lib/bower/strategy');

program
  .usage('[options] [packageName ...]')
  .option('-i, install', 'Install packages')
  .option('-P, --production', 'Install/Pack production packages')
  .option('-s, --strategy [type]', 'Uses specified strategy [npm|bower] to install/pack packages. Default is "npm"', 'npm')
  .option('-v, --verbose', 'Logs out verbose log messages');

program.on('--help', function() {
  console.log('  Examples:');
  console.log('');
  console.log('    $ pac -P install');
  console.log('    $ pac grunt');
  console.log('    $ pac -s bower install');
  console.log('    $ pac -s bower angular');
  console.log('');
});

program.parse(process.argv);

// Determine which strategy to use
var strategy;
if (program.strategy === 'bower') {
  strategy = new BowerStrategy({
    mode: program.production ? 'production' : 'develop',
    verbose: program.verbose ? true : false
  });
} else if (program.strategy === 'npm') {
  strategy = new NpmStrategy({
    mode: program.production ? 'production' : 'develop',
    verbose: program.verbose ? true : false
  });
} else {
  console.error('Specified strategy is not supported');
  process.exit(1);
}

if (program.install) {
  strategy.install();
} else {
  if (program.args >= 1) {
    program.args.forEach(function(module) {
      strategy.pack(module);
    });
  } else {
    strategy.pack();
  }
}