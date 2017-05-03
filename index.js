#!/usr/bin/env node

'use strict';

const childProcess = require('child_process');

const minimist = require('minimist');

// local libraries
const Application = require('./browser/application.js');

const argv = minimist(process.argv.slice(2));
if (argv.detach) {
  // remove --detach
  const detachIndex = process.argv.indexOf('--detach');
  process.argv.splice(detachIndex, 1);
  childProcess.spawn(process.argv[0], process.argv.slice(1), {
    detached: true,
    stdio: 'ignore',
  }).unref();
  process.exit(0);
} else {
  const app = new Application(argv);
  app.run();
}
