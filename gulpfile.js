'use strict';

// Recomment to run with gulper command.
// gulper is a wrapper command of gulp to restart gulp when gulpfile.s is updated.
// gulper command can be installed by 'npm install -g gulper'.
const fs = require('fs');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const jsSources = ['index.js', 'gulpfile.js',
                   './browser/**/*.js', './renderer/**/*.js'];
const iconPath = 'dist/icon.icns';

gulp.task('lint', () => {
  return gulp.src(jsSources)
    .pipe($.eslint({
      env: {
        browser: true,
        node: true,
      },
      extends: 'eslint:recommended',
      globals: [
        '__dirname',
        'console',
        'document',
        'he',
        'mermaidAPI',
        'module',
        'process',
        'require',
      ],
      parserOptions: {
        ecmaVersion: 6
      },
      rules: {
        'block-spacing': 2,
        'camelcase': 2,
        'no-multiple-empty-lines': ['error', {'max': 2}],
        'no-undef': 'error',
        'no-unused-vars': ['error', {'args': 'none'}],
        // 'sort-keys': ['error', 'asc', {'caseSensitive': false}],
        'strict': 0,
      },
    }))
    .pipe($.eslint.format());
});

gulp.task('watch', ['lint'], () => {
  gulp.watch(jsSources, ['lint']);
});

gulp.task('icon', () => {
  // remove iconPath first if it exists
  if (fs.existsSync(iconPath)) {
    fs.unlinkSync(iconPath);
  }
  return gulp.src('resources/logo.png')
    .pipe($.exec(`nicns --in resources/logo.png --out ${iconPath}`))
    .pipe($.exec.reporter({
      err: true,
      stderr: true,
      stdout: true
    }));
});

function buildElectronPackagerCommands(platforms) {
  return platforms.map((platform) => {
    return `electron-packager . m --platform=${platform} --arch=x64 --icon=${iconPath} ` +
      `--overwrite --out dist/build`;
  });
}
const electronBuildCommands = buildElectronPackagerCommands(['darwin']);

electronBuildCommands.forEach((command) => {
  gulp.task(command, ['icon'], () => {
    return gulp.src('')
      .pipe($.exec(command, {
        pipeStdout: true
      }))
      .pipe($.exec.reporter({
        err: true,
        stderr: true,
        stdout: true
      }));
  });
});
gulp.task('build', electronBuildCommands);

gulp.task('default', ['lint']);
