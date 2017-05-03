#!/usr/bin/env node

'use strict';

const minimist = require('minimist');

const Application = require('./browser/application.js');

const argv = minimist(process.argv.slice(2));
const app = new Application(argv);
app.run();
