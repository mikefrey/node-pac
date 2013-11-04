var packer = require('./packer.js')
var installer = require('./installer.js')

// naive
if (~process.argv.indexOf('install')) {
  installer()
} else {
  var arg = process.argv[0] == 'node' ? process.argv[2] : process.argv[1]
  packer(arg)
}

