
# Interleave

Interleave is a web construction tool that is designed to help developers
build well structured libraries and also web applications.


[![NPM](https://nodei.co/npm/interleave.png)](https://nodei.co/npm/interleave/)

[![Build Status](https://api.travis-ci.org/buildjs/interleave.svg?branch=master)](https://travis-ci.org/buildjs/interleave) [![bitHound Score](https://www.bithound.io/github/buildjs/interleave/badges/score.svg)](https://www.bithound.io/github/buildjs/interleave) 

## Installation

If you are looking to use the latest version of Interleave, simply run
the npm install command as indicated by the nodei.co badge above.

If you have been using Interleave 0.3.x (or possibly 0.4.x) then you
should install that particular version:

## Why Interleave Exists

Interleave was written primarily as a JS alternative to
[Sprockets](https://github.com/sstephenson/sprockets) which uses a similar
comment directed include system.  I used interleave for a couple of years
to create more structured JS projects.

## Why I no longer use Interleave

Personally, I don't use Interleave much at all anymore.  Why?  Well
primarily I found myself spending more time tweaking build tools than
actually spending time working on projects.  Additionally, once I saw
what [substack](https://github.com/substack) was doing with
[Browserify](https://github.com/substack/node-browserify) from version 2
onwards it became clear to me that for most projects that was a better
solution.

This is primarily due to it being used in combination with
[npm](https://www.npmjs.org/) for managing module dependencies.  While I
felt strongly for a time that browser modules did not belong in NPM, I now
believe I was quite wrong and it has proven to be one of the most
effective ways of managing software dependencies that I have ever worked
with.

All of that said, if Interleave is a good fit for you then you should use
it and I'll try to keep it up to date so it continues to work in current
node versions.

## How To Use Interleave

Interleave is designed to be used primarily as a command-line tool in
it's own right, but can also be integrated with build tools like
[Jake](https://github.com/mde/Jake) using a
[simple API](/DamonOehlman/interleave/wiki/API).

When using a tool like Interleave it's a good idea to create a `src/`
directory (or similar) in which your raw source files will be created.
Personally, I find it works really well to put whichever files you wish
to create a distribution for in this `src/` folder and then place other
sources that will be "rigged" in within subdirectories within the `src/`.

The following is one example of how a project using Interleave could be
structured:

    - src/
      |- core/
         |- a.js
         |- b.coffee
      |- mylibrary.js
    - README.md

The contents of `src/mylibrary.js` would look something like:

```js
//= core/a
//= core/b.coffee
```

You could then build your library / app using the following command:

```
interleave build src/*.js
```

In fact, as Interleave is built with "convention over configuration" in
mind, you can actually run just `interleave build` and Interleave will
infer that you want to build all `.js` files within the `src/` folder.

Once the `interleave` command has finished, a `dist/` folder (by default)
will be created and your generated `mylibrary.js` file will exist in that
folder.

For this and more examples, see the
[examples](/DamonOehlman/interleave/tree/master/examples) folder of
this repo.

## Packaging for AMD, CommonJS and the Browser

By default, Interleave will take your input files, rig in specified
includes and spit out the combined result in a `dist` folder with a
[UMDjs](https://github.com/umdjs/umd) compatible header.  If you
specifically want to create separate files for each of the different
module approaches then you can use the `--wrap` option to specify either
one module pattern only (e.g. `--wrap=amd`) or just tell Interleave that
you want separate files by passing with switch in (`--wrap`).

For instance, the following command would take `.js` files in the `src/`
folder and generate `amd`, `commonjs` and `glob` variants in the `dist/`
folder:

```
interleave build src/*.js --wrap
```

In the case that you only want specific platform variants (e.g. AMD)
specify a comma-delimited list for the `--wrap` option:

```
interleave build src/*.js --wrap glob,amd
```

## CoffeeScript, Stylus and Friends are Treated Well

If you use [CoffeeScript](http://coffeescript.org/),
[Stylus](http://learnboost.github.com/stylus/) or other precompilers
these are well treated by Interleave (courtesy of
[Rigger](https://github.com/DamonOehlman/rigger)).  Unlike the core
Rigger engine though, Interleave will assume that you want to convert
source `.coffee`, `.styl`, etc files into their web consumable
equivalents (i.e. `.js`, `.css`, etc).

## Other Command Line Options

The following command line options are supported by Interleave.

### Common Command Line Opts

    --version

Print the Interleave version

    --help

Print a list of commands supported by Interleave

    --help [command]

Print the information related to [command]

__NOTE:__ Help commands are still to be implemented in scaffolder
(see: DamonOehlman/scaffolder#3)

### `build` Command Options

    --output [path]

The directory in which output files will be generated. (default: dist/)

    --wrap [platformTypes]

Used to tell Interleave to wrap distributions for particular types of
platforms. (default: amd,commonjs,glob)

## License(s)

### MIT

Copyright (c) 2016 Damon Oehlman <damon.oehlman@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
