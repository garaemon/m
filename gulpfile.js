'use strict';

// Recomment to run with gulper command.
// gulper is a wrapper command of gulp to restart gulp when gulpfile.s is updated.
// gulper command can be installed by 'npm install -g gulper'.
const fs = require('fs');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const jsSources = ['index.js', 'gulpfile.js',
                   './browser/**/*.js', './renderer/**/*.js',
                   './polymer_components/*.html'];
const polymerSources = ['./polymer_components/*.html'];
const macIconPath = 'resources/logo.icns';

/**
 * @param {string[]} sources file(s) to run javascrpt lint task.
 * @return {Transform} gulp task
 */
function getJavascriptLintDefaultTask(sources) {
  return gulp.src(sources)
    .pipe($.eslint())
    .pipe($.eslint.format());
}

/**
 * @param {string[]} sources file(s) to run javascrpt lint task.
 * @return {Transform} gulp task
 */
function getPolylintDefaultTask(sources) {
  return gulp.src(sources)
    .pipe($.polylint())
    .pipe($.polylint.reporter($.polylint.reporter.stylishlike));
}

gulp.task('js-lint', () => {
  return getJavascriptLintDefaultTask(jsSources);
});

gulp.task('js-lint-fail-on-error', () => {
  return getJavascriptLintDefaultTask(jsSources)
    .pipe($.eslint.failOnError());
});

gulp.task('polylint', () => {
  return getPolylintDefaultTask(polymerSources);
});

gulp.task('polylint-fail-on-error', () => {
  return getPolylintDefaultTask(polymerSources)
    .pipe($.polylint.reporter.fail({
      buffer: true,
      ignoreWarnings: false}));
});

gulp.task('lint', ['js-lint', 'polylint']);
gulp.task('lint-fail-on-error', ['js-lint-fail-on-error', 'polylint-fail-on-error']);

gulp.task('watch', ['lint'], () => {
  gulp.watch(jsSources, ['lint']);
});

gulp.task('icon', () => {
  // remove iconPath first if it exists
  if (fs.existsSync(macIconPath)) {
    fs.unlinkSync(macIconPath);
  }
  return gulp.src('resources/logo.png')
    .pipe($.exec(`nicns --in resources/logo.png --out ${macIconPath}`))
    .pipe($.exec.reporter({
      err: true,
      stderr: true,
      stdout: true,
    }));
});

/**
 * @param {string} platform
 * @return {string} --icon option for electron-packager
 */
function getPlatformDependendOption(platform) {
  if (platform == 'darwin') {
    return `--icon=${macIconPath}`;
  } else {
    return '';
  }
}

/**
 * @param {string[]} platforms list of platforms
 * @return {string[]} commands to execute electron-packer
 */
function buildElectronPackagerCommands(platforms) {
  return platforms.map((platform) => {
    const platformDependendOption = getPlatformDependendOption(platform);
    return `electron-packager . m --platform=${platform} --arch=x64 ${platformDependendOption} ` +
      '--overwrite --out dist/build';
  });
}
const electronBuildCommands = buildElectronPackagerCommands(['darwin', 'linux']);

electronBuildCommands.forEach((command) => {
  gulp.task(command, () => {
    return gulp.src('')
      .pipe($.exec(command, {
        pipeStdout: true,
      }))
      .pipe($.exec.reporter({
        err: true,
        stderr: true,
        stdout: true,
      }));
  });
});

gulp.task('build', electronBuildCommands);

gulp.task('test', ['lint-fail-on-error', 'build']);

gulp.task('default', ['lint']);
