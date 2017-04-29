'use strict';

// Recomment to run with gulper command.
// gulper is a wrapper command of gulp to restart gulp when gulpfile.s is updated.
// gulper command can be installed by 'npm install -g gulper'.
const fs = require('fs');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const jsSources = ['index.js', 'gulpfile.js',
                   './browser/**/*.js', './renderer/**/*.js', './polymer_components/*.html'];
const macIconPath = 'resources/logo.icns';

function getJavascriptLintDefaultTask(sources) {
  return gulp.src(sources)
    .pipe($.eslint())
    .pipe($.eslint.format());
}

gulp.task('lint', () => {
  return getJavascriptLintDefaultTask(jsSources);
});

gulp.task('lint-fail-on-error', () => {
  return getJavascriptLintDefaultTask(jsSources)
    .pipe($.eslint.failOnError());
});

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
      stdout: true
    }));
});

function getPlatformDependendOption(platform) {
  if (platform == 'darwin') {
    return `--icon=${macIconPath}`;
  } else {
    return '';
  }
}

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

gulp.task('test', ['lint-fail-on-error', 'build']);

gulp.task('default', ['lint']);
