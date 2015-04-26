'use strict';

var should = require('chai').should();
var _ = require('underscore');
var async = require('async');
var glob = require('glob');
var fs = require('fs-extra');
var tgz = require('tar.gz');
var Path = require('path');
var BowerStrategy = require(Path.resolve(__dirname, '../../lib/bower/strategy'));

describe('BowerStrategy', function() {

	var bowerComponentsDir = Path.resolve(__dirname, '../fixture', 'app', 'bower_components');
	var modulesDir = Path.resolve(__dirname, '../fixture', '.modules');
  var sep = '-v';
  var extension = '.tgz';

	describe('#Install', function() {

		beforeEach(function(done) {

			// remove all existing, installed bower components
			fs.removeSync(bowerComponentsDir);
			fs.mkdirpSync(bowerComponentsDir);

			fs.removeSync(modulesDir);
			fs.mkdirpSync(modulesDir);

			var modules = glob.sync(Path.resolve(__dirname, '../fixture', 'modules', 'bower') + '/*');
			async.each(modules, function(modulePath, cb) {
				var pkg = require(Path.resolve(modulePath, '.bower.json'));
				var version = pkg.version || '*';
				var name = Path.basename(modulePath);
				var dest = Path.join(modulesDir, name + sep + version + '.tgz');

				new tgz().compress(modulePath, dest, function(err) {
					if (err) {
						done(err);
					} else {
						cb();
					}
				});
			}, function(err) {
				if (!err) {
					done();
				} else {
					done(err);
				}
			});
		});

		it('should install all bower components to the bower_components folder', function(done) {
			var strategy = new BowerStrategy({
				cwd: Path.resolve(__dirname, '../fixture')
			});

			strategy.install(function() {
				var installedComponents = fs.readdirSync(bowerComponentsDir);
				var bowerjson = require(Path.resolve(__dirname, '../fixture', 'bower.json'));
				var toBeInstalledComponents = Object.keys(bowerjson.dependencies);
				toBeInstalledComponents = toBeInstalledComponents.concat(Object.keys(bowerjson.devDependencies));

				var result = _.difference(installedComponents, toBeInstalledComponents);
				result.length.should.equal(0);

				done();
			});
		});

		it('should install production bower components to the bower_components folder', function(done) {
			var strategy = new BowerStrategy({
				cwd: Path.resolve(__dirname, '../fixture'),
				mode: 'production'
			});
			strategy.install(function() {
				var installedComponents = fs.readdirSync(bowerComponentsDir);
				var bowerjson = require(Path.resolve(__dirname, '../fixture', 'bower.json'));
				var toBeInstalledComponents = Object.keys(bowerjson.dependencies);

				var result = _.difference(installedComponents, toBeInstalledComponents);
				result.length.should.equal(0);

				done();
			});
		});
	});

	describe('#Pac', function() {

		beforeEach(function(done) {
			fs.removeSync(modulesDir);
			fs.mkdirpSync(modulesDir);

			fs.removeSync(bowerComponentsDir);
			fs.mkdirpSync(bowerComponentsDir);

			fs.copy(Path.resolve(__dirname, '../fixture', 'modules', 'bower'), bowerComponentsDir, function(err) {
				if (!err) {
					done();
				}
			});
		});

		it('should pac specified bower component to .modules folder', function(done) {
			var packageToInstall = 'packageA';

			var strategy = new BowerStrategy({
				cwd: Path.resolve(__dirname, '../fixture')
			});
			strategy.pack(packageToInstall, function() {
				var installedComponents = fs.readdirSync(modulesDir);
				installedComponents.length.should.equal(1);

        var version = require(Path.resolve(bowerComponentsDir, packageToInstall, '.bower.json')).version || '*';
        var installedComponentName = packageToInstall + sep + version + extension;
				installedComponents[0].should.equal(installedComponentName);

				done();	
			});
		});

		it('should pac all bower components to .modules folder', function(done) {
			var strategy = new BowerStrategy({
				cwd: Path.resolve(__dirname, '../fixture')
			});
			strategy.pack(function() {
				var packedComponents = fs.readdirSync(modulesDir);
				var bowerjson = require(Path.resolve(__dirname, '../fixture', 'bower.json'));
				var toBePackedComponents = Object.keys(bowerjson.dependencies);
        toBePackedComponents = toBePackedComponents.concat(Object.keys(bowerjson.devDependencies));

        toBePackedComponents.forEach(function(componentName) {
          var version = require(Path.resolve(bowerComponentsDir, componentName, '.bower.json')).version || '*';
          var installedComponentName = componentName + sep + version + extension;

          packedComponents.indexOf(installedComponentName).should.not.equal(-1);
        });

				done();	
			});
		});

		it('should pac prodcution bower compoenents to .modules folder', function(done) {
			var strategy = new BowerStrategy({
				cwd: Path.resolve(__dirname, '../fixture'),
				mode: 'production'
			});
			strategy.pack(function() {
				var packedComponents = fs.readdirSync(modulesDir);
				var bowerjson = require(Path.resolve(__dirname, '../fixture', 'bower.json'));
				var toBePackedComponents = Object.keys(bowerjson.dependencies);

        toBePackedComponents.forEach(function(componentName) {
          var version = require(Path.resolve(bowerComponentsDir, componentName, '.bower.json')).version || '*';
          var installedComponentName = componentName + sep + version + extension;

          packedComponents.indexOf(installedComponentName).should.not.equal(-1);
        });

				done();	
			});
		});
	});

});