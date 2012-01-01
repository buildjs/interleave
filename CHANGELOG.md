# Interleave Changelog

Here be the history of Interleave.

## 0.1.0

- Refactored preprocessor integration to allow simpler preprocessor creation
- Added support for Roy preprocessor

## 0.0.9 (In Development)

* Experimental support for [dr.js](https://github.com/DmitryBaranovskiy/dr.js)
* Fix issue where pretty comments using multiple equals were being interpreted as an include
* Fix issue where includes were quoted

## 0.0.8 (Published)

* Fixed error handling for preprocessors

## 0.0.7 (Published)

* Added preprocessors support
* Added preprocessor: [Stylus](http://learnboost.github.com/stylus/)
* Added preprocessor: [CoffeeScript](http://coffeescript.org/)

## 0.0.5 (Published)

* Added `gcode://` loader - `googlecode://` also works...
* Added support for aliasing local files
* Made the output colourful
* Fixed #1

## 0.0.4 (Published)

* Added the `pass` multihandler, which simply passes all input files through, interleaves and writes them out to the output directory.

* Added aliases and `build.json` configuration file support.

* Tweaked things to using Interleave programmatically is possible.

## 0.0.3

* Added support for loading multiple files from a path, e.g. `interleave testfiles`
* Added bitbucket loader

## 0.0.2

* Added github and http loader support

## 0.0.1

Initial version.  It worked.