# Interleave

Interleave is a web construction tool that is designed to help developers build well structured libraries and also web applications.  The current (`0.5.x`) development branch is a complete ground-up rewrite of the library which uses a variety of other packages to help make the magic happen.

## Installation

If you are looking to use the latest version of Interleave, simply run the following command:

```
[sudo] npm install -g interleave
```

If you have been using Interleave 0.3.x (or possibly 0.4.x) then you should install that particular version:

```
[sudo] npm install -g interleave@0.3.x
```

## Why Interleave Exists

The reason that Interleave (and underlying include engine [Rigger](https://github.com/DamonOehlman/rigger)) exists that I believe that our current techniques for building JS libraries, and also rich web applications are not going to see us too many more years into the future.

We need to place effort and emphasis on creating JS components that are usable both in the browser and in server environments (such as [NodeJS](http://nodejs.org) and [CouchDB](http://couchdb.apache.org/)).

There have been some excellent attempts to make this work from the NodeJS side up (see tools like [Browserify](https://github.com/substack/node-browserify)) but client-side libraries still largely use fairly primitive file concatenation as the basis for library builds.

I started Interleave some time ago, taking inspiration from [Sprockets](https://github.com/sstephenson/sprockets) and finally, after many months of development on it and [components of the solution stack](/DamonOehlman/interleave/wiki/Solution-Stack), Interleave is starting to really come together.

## How To Use Interleave

- TO BE COMPLETED

## Packaging for AMD, CommonJS and the Browser

By default, Interleave will take your input files, rig in specified includes and spit out the combined result in a `dist` folder.  If you are building a library that you want to work on multiple platforms (AMD, CommonJS, etc) then consider using the `--wrap` option to generate packages tailored for each of the platforms.

In cases where you are writing a dependency-free library (which [isn't something that should always be encouraged](/DamonOehlman/damonoehlman.github.com/issues/5)) then you can simply write your library source incorporating one of the [UMD](https://github.com/umdjs/umd) patterns and generate a single file.

## Other Command Line Options

TO BE COMPLETED.