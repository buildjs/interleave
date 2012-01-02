<img src="https://github.com/DamonOehlman/interleave/raw/master/assets/interleave-logo.png " title="Interleave" />

Interleave is a tool that helps you organise and "compile" your JS in a [beyond concatenation](http://www.distractable.net/coding/javascript-builds-beyond-concatenation) way.  It allows you to not only include files from your local file system, but remotely from [Github](http://github.com/), [Bitbucket](http://bitbucket.org) (and other) online sources.

## Installation

Install using [npm](http://npmjs.org/):

`npm install -g interleave`

## Usage

Interleave is designed as a command-line tool, but also supports [programmatic use](https://github.com/DamonOehlman/interleave/wiki/Programmatic-Use).  In the simplest case, where you have a single input file to be processed you would probably run:

```
interleave src/main.js
```

This would parse the `main.js` file in the `src` folder and generate a `main.js` in a `dist` folder.  If the dist folder does not exist, then it will be automatically created.

Alternatively you can also call interleave and just specify that you want it to process the `src` directory.  In this case, each of the files (_not recursive_) in the `src` folder would be processed individually and pushed to the `dist` folder.

### Command Line Switches

Interleave supports a number of command-line switches which can be viewed by running `interleave --help`

## Include Patterns

Include statements in interleave are similar (see the [wiki](https://github.com/DamonOehlman/interleave/wiki/Include-Patterns) for more detailed info) to those used in [Sprockets](http://getsprockets.com/).  An include request for instance is a single-line comment with an equal sign __straight after__ the two slashes: `//=` __followed by some whitespace__, and then the file to include:

```js
//= file/to/include.js
```

The extension is not required, so the following is also valid:

```js
//= file/to/include
```

Interleave also supports some url-esque include formats for including remote files.  These are covered in more detail in the [wiki](https://github.com/DamonOehlman/interleave/wiki/Include-Patterns).  In summary though, all the of the following are valid:

```js
//= github://documentcloud/underscore/underscore
//= github://documentcloud/underscore/underscore?v=1.1.2
//= bitbucket://puffnfresh/roy/src/types
//= gcode://glmatrix/hg/glMatrix
//= http://code.jquery.com/jquery-1.6.2.js
```

## Additional Information

### Watching for Changes

You can also ask interleave to watch your sourcefile for changes and only compile files when it does detect a change.  This is done by supplying the `--watch` option:

```
interleave src --watch
```

### Pre-processors

Pre-processors provide a mechanism to integrate languages such as [CoffeeScript](http://coffeescript.org) and [Roy](http://roy.brianmckenna.org/) into your JS build process.  Additionally, if you are using Interleave to process CSS files, CSS preprocessors such as [Stylus](http://learnboost.github.com/stylus/) into the mix also.

More information on preprocessors can be found in the [wiki](https://github.com/DamonOehlman/interleave/wiki/Preprocessors).

### Post-processors

Post-processors unsurprisingly do the opposite to a pre-processor.  They perform operations on the resulting JS and CSS files generated from Interleave.  Probably the most common use is to pack or minify your JS, and at present [Uglify](https://github.com/mishoo/UglifyJS) is supported for packing.

More information on post-processors can be find in the [wiki](https://github.com/DamonOehlman/interleave/wiki/Postprocessors)

### Aliases

Another feature you can use when working with Interleave are __aliases__.  Aliases are a very powerful feature that will allow you to change the location that a particular include is sourced from. 

For more information on aliases see the [wiki](https://github.com/DamonOehlman/interleave/wiki/Aliases)

### Build Configurations

Often used to specify alias definitions, a `build.json` file can be a useful inclusion in your project, and can save having to remember a number of command-line options that are required for particular project builds.

For more information on build configurations see the [wiki](https://github.com/DamonOehlman/interleave/wiki/Build-Configurations)

## Changelog

See [CHANGELOG.md](https://github.com/DamonOehlman/interleave/blob/master/CHANGELOG.md).

## To Do

- Add real tests instead of just an example
- Add an `npm://` loader for supported file
- Caching remote includes in a local cache

## Questions Feedback

Just drop in an [issue](https://github.com/DamonOehlman/interleave/issues), I find it works really well.

## License

[MIT](https://github.com/DamonOehlman/interleave/blob/master/LICENSE.md)