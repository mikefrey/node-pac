'use strict';

var should = require('chai').should();
var _ = require('underscore');
var async = require('async');
var glob = require('glob');
var fs = require('fs-extra');
var tgz = require('tar.gz');
var Path = require('path');
var NpmStrategy = require(Path.resolve(__dirname, '../../lib/npm/strategy'));

describe('NpmStrategy', function() {

	var npmModulesDir = Path.resolve(__dirname, '../fixture', 'node_modules');
	var modulesDir = Path.resolve(__dirname, '../fixture', '.modules');
	var sep = '-v';
	var extension = '.tgz';

	describe('#Install', function() {

		beforeEach(function(done) {

			// remove all existing, installed npm modules
			fs.removeSync(npmModulesDir);
			fs.mkdirpSync(npmModulesDir);

			fs.removeSync(modulesDir);
			fs.mkdirpSync(modulesDir);

			var modules = glob.sync(Path.resolve(__dirname, '../fixture', 'modules', 'npm') + '/*');
			async.each(modules, function(modulePath, cb) {
				var pkg = require(Path.resolve(modulePath, 'package.json'));
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

		it('should install all npm modules to the node_modules folder', function(done) {
			var strategy = new NpmStrategy({
				cwd: Path.resolve(__dirname, '../fixture')
			});

			strategy.install(function() {
				var installedModules = fs.readdirSync(npmModulesDir);
				var packagejson = require(Path.resolve(__dirname, '../fixture', 'package.json'));
				var toBeinstalledModules = Object.keys(packagejson.dependencies);
				toBeinstalledModules = toBeinstalledModules.concat(Object.keys(packagejson.devDependencies));

				var result = _.difference(installedModules, toBeinstalledModules);
				result.length.should.equal(0);

				done();
			});
		});

		it('should install production npm modules to the node_modules folder', function(done) {
			var strategy = new NpmStrategy({
				cwd: Path.resolve(__dirname, '../fixture'),
				mode: 'production'
			});
			strategy.install(function() {
				var installedModules = fs.readdirSync(npmModulesDir);
				var packagejson = require(Path.resolve(__dirname, '../fixture', 'package.json'));
				var toBeinstalledModules = Object.keys(packagejson.dependencies);

				var result = _.difference(installedModules, toBeinstalledModules);
				result.length.should.equal(0);

				done();
			});
		});
	});

	describe('#Pac', function() {

		beforeEach(function(done) {
			fs.removeSync(modulesDir);
			fs.mkdirpSync(modulesDir);

			fs.removeSync(npmModulesDir);
			fs.mkdirpSync(npmModulesDir);

			fs.copy(Path.resolve(__dirname, '../fixture', 'modules', 'npm'), npmModulesDir, function(err) {
				if (!err) {
					done();
				}
			});
		});

		it('should pac specified npm modules to .modules folder', function(done) {
			var moduleToInstall = 'moduleA';

			var strategy = new NpmStrategy({
				cwd: Path.resolve(__dirname, '../fixture')
			});
			strategy.pack(moduleToInstall, function() {
				var installedModules = fs.readdirSync(modulesDir);
				installedModules.length.should.equal(1);

				var version = require(Path.resolve(npmModulesDir, moduleToInstall, 'package.json')).version || '*';
				var installedModuleName = moduleToInstall + sep + version + extension;
				installedModules[0].should.equal(installedModuleName);

				done();
			});
		});

		it('should pac all npm modules to .modules folder', function(done) {
			var strategy = new NpmStrategy({
				cwd: Path.resolve(__dirname, '../fixture')
			});
			strategy.pack(function() {
				var packedModules = fs.readdirSync(modulesDir);
				var packagejson = require(Path.resolve(__dirname, '../fixture', 'package.json'));
				var toBePackedModules = Object.keys(packagejson.dependencies);
				toBePackedModules = toBePackedModules.concat(Object.keys(packagejson.devDependencies));

				toBePackedModules.forEach(function(moduleName) {
					var version = require(Path.resolve(npmModulesDir, moduleName, 'package.json')).version || '*';
					var installedModuleName = moduleName + sep + version + extension;

					packedModules.indexOf(installedModuleName).should.not.equal(-1);
				});

				done();
			});
		});

		it('should pac prodcution npm modules to .modules folder', function(done) {
			var strategy = new NpmStrategy({
				cwd: Path.resolve(__dirname, '../fixture'),
				mode: 'production'
			});
			strategy.pack(function() {
				var packedModules = fs.readdirSync(modulesDir);
				var packagejson = require(Path.resolve(__dirname, '../fixture', 'package.json'));
				var toBePackedModules = Object.keys(packagejson.dependencies);

				toBePackedModules.forEach(function(moduleName) {
					var version = require(Path.resolve(npmModulesDir, moduleName, 'package.json')).version || '*';
					var installedModuleName = moduleName + sep + version + extension;

					packedModules.indexOf(installedModuleName).should.not.equal(-1);
				});

				done();
			});
		});
	});

});