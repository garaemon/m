'use strict';

// Recomment to run with gulper command.
// gulper is a wrapper command of gulp to restart gulp when gulpfile.s is updated.
// gulper command can be installed by 'npm install -g gulper'.

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const jsSources = ['index.js', './browser/**/*.js', './renderer/**/*.js'];

gulp.task('jshint', () => {
  return gulp.src(jsSources)
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('watch', () => {
  gulp.watch(jsSources, ['jshint']);
});

gulp.task('default', ['jshint']);
