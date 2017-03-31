#!/bin/bash

# build icon for mac first
logo_path=$(gmktemp --suffix=.icns)
# install by `npm install -g node-icns`
nicns --in "resources/logo.png" --out "${logo_path}"
# build package for mac
# install by `npm install -g electron-packager`
electron-packager . m --platform=darwin --arch=x64 --icon="${logo_path}" --overwrite --out build
