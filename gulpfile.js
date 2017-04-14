'use strict';

// Recomment to run with gulper command.
// gulper is a wrapper command of gulp to restart gulp when gulpfile.s is updated.
// gulper command can be installed by 'npm install -g gulper'.

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const jsSources = ['index.js', 'gulpfile.js',
                   './browser/**/*.js', './renderer/**/*.js'];

// gulp.task('lint', () => {
//   return gulp.src(jsSources)
//     .pipe($.jshint())
//     .pipe($.jshint.reporter('jshint-stylish'));
// });

gulp.task('lint', () => {
  return gulp.src(jsSources)
    .pipe($.eslint({
      rules: {
        'strict': 0,
        'block-spacing': 2,
        'camelcase': 2,
        'no-undef': 'error'
      },
      env: {
        node: true,
        browser: true
      },
      parserOptions: {
        ecmaVersion: 6
      },
      globals: [
        'console',
        'require',
        'document',
        '__dirname',
        'module',
        'mermaidAPI',
        'he',
        'process',
      ],
    }))
    .pipe($.eslint.format());
});

gulp.task('watch', () => {
  gulp.watch(jsSources, ['lint']);
});

gulp.task('default', ['lint']);
