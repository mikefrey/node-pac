'use strict';

var gulp = require('gulp');

// Load plugins
var $ = require('gulp-load-plugins')();

gulp.task('beautify', function() {
  return gulp.src('./lib/**/*.js')
    .pipe($.jsPrettify({
      indent_size: 2,
      indent_char: ' ',
      indent_level: 0,
      indent_with_tabs: false,
      preserve_newlines: true,
      max_preserve_newlines: 4,
      jslint_happy: true,
      brace_style: 'collapse',
      keep_array_indentation: false,
      keep_function_indentation: false,
      space_before_conditional: true,
      break_chained_methods: false,
      eval_code: false,
      unescape_strings: false,
      wrap_line_length: 0
    }))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('jshint', ['beautify'], function() {
  return gulp.src('./lib/**/*.js')
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('istanbul', ['jshint'], function() {
  return gulp.src('./lib/**/*.js').pipe($.istanbul());
});

gulp.task('mocha', ['istanbul'], function() {
  var chai = require('chai');
  global.should = chai.should();

  return gulp.src(['./test/npm/**/*.js', './test/bower/**/*.js'])
    .pipe($.mocha({
      reporter: 'spec',
      globals: ['should']
    }))
    .pipe($.istanbul.writeReports());
});

gulp.task('build', ['jshint', 'mocha']);

gulp.task('default', ['build'], function() {
  return gulp.src(['gulpfile.js']).pipe($.exit());
});