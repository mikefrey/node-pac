var packer = require('./packer.js')
var installer = require('./installer.js')

// naive
if (~process.argv.indexOf('install')) {
  installer()
} else {
  packer()
}

