'use strict';

const minimist = require('minimist');

// local libraries
const Application = require('./browser/application.js');

const argv = minimist(process.argv.slice(2));

const app = new Application(argv);
