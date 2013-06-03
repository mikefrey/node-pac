var fs = require('fs')
var tgz = require('tar.gz')
var mkdirp = require('mkdirp')
var Path = require('path')
var glob = require('glob')
var semver = require('semver')

var cwd = process.cwd()

var pkgjson = require(Path.join(cwd, 'package.json'))
var modulePath = Path.join(cwd, '.modules')

var sep = '@'

// ensure that the .modules directory exists
mkdirp.sync(modulePath)


var log = function() {
  console.log.apply(console, arguments)
}

var error = function() {
  console.error.apply(console, arguments)
}

var tryRequire = function(p) {
  try {
    return require(p)
  } catch(ex) {
    error('Failed to load', p)
  }
  return null
}

var pack = function(name, version) {
  log('Packing', name+sep+version)
  var source = Path.join(cwd, 'node_modules', name)
  var dest = Path.join(modulePath, name+sep+version+'.tgz')
  new tgz().compress(source, dest, function(err) {
    if (err)
      error('Failed to pack', name)
    else
      log('Packed', name)
  })
}


var filesToHash = function(files) {
  return curFiles.reduce(function(memo, file) {
  var f = file.replace(/\.tgz$/i, '').split(sep)
  memo[f[0]] = f[1]
  return memo
}, {})
}

// get a list of all the currently created files
var curFiles = glob.sync('*.tgz', {cwd:modulePath})

// separate the file list into a hash of name/version
var curMods = filesToHash()

// get dependency list
var deps = pkgjson.dependencies

// remove any packed modules that aren't needed
// or don't meet version requirements
Object.keys(curMods).forEach(function(name) {
  if (!deps[name] || !semver.satisfies(curMods[name], deps[name])) {
    var fv = name+sep+curMods[name]
    log('Removing ', fv)
    fs.unlinkSync(Path.join(modulePath, fv))
    delete curMods[name]
  }
})



// figure out what modules need packing up and pack them
Object.keys(deps).forEach(function(name) {
  var needs = deps[name]
  if (!curMods[name]) {
    var pkg = tryRequire(Path.join(cwd, 'node_modules', name, 'package.json'))
    if (pkg && semver.satisfies(pkg.version, needs)) {
      pack(name, pkg.version)
    } else {
      error('Unmet dependency', name+sep+needs)
    }
  }
})
