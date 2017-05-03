#!/usr/bin/env node

// Entry point for command line
// http://blog.soulserv.net/building-a-package-featuring-electron-as-a-stand-alone-application/

// It just returns a path
const electronPath = require('electron-prebuilt');
const childProcess = require('child_process');
const minimist = require('minimist');

// Adjust the command line arguments: remove the "node <code.js>" part
const args = process.argv.slice(2);
const parsedArgs = minimist(process.argv.slice(2));

// ... and insert the root path of our application (it's the parent directory)
// as the first argument
args.unshift(__dirname + '/../');

if (parsedArgs.detach) {
  // remove --detach from process.argv
  const detachIndex = args.indexOf('--detach');
  args.splice(detachIndex, 1);
  childProcess.spawn(electronPath, args, {
    detached: true,
    stdio: 'ignore',
  }).unref();
} else {
  // Run electron
  childProcess.spawn(electronPath, args, {
    stdio: 'inherit',
  });
}