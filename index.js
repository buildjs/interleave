var async = require('async');
var builder = require('./lib/builder');
var debug = require('debug')('interleave');
var glob = require('glob');
var path = require('path');
var reporter = require('reporter');
var squirrel = require('squirrel');
var _ = require('underscore');

var reCommaDelim = /\,\s*/;
var transpileTargets = {
  styl: '.css',
  coffee: '.js'
};

/**
    # Interleave

    Interleave is a web construction tool that is designed to help developers
    build well structured libraries and also web applications.

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
**/

function interleave(targets, opts, callback) {
  // remap opts if required
  if (typeof opts == 'function') {
    callback = opts;
    opts = {};
  }

  // TODO: normalize the opts
  opts = _.extend({}, opts);

  // set the default path to the cwd
  opts.sourcePath = opts.sourcePath || path.resolve('src');
  opts.output     = opts.output     || path.resolve('dist');

  // if the user is attempting to both wrap and resolve, report an error
  if (opts.resolve && opts.wrap) return callback(new Error('Cannot wrap AND resolve'));

  // if wrap is specified, and has defaulted to 'true' (no options specified, then set defaults)
  if (opts.wrap === '' || opts.wrap === 'true' || opts.wrap === true) {
    opts.wrap = ['amd', 'commonjs', 'glob'];
  }

  // if we have a wrap option as a string, then split
  if (typeof opts.wrap == 'string' || (opts.wrap instanceof String)) {
    opts.wrap = opts.wrap.split(reCommaDelim);
  }

  // update the squirrel all install options
  squirrel.defaults.allowInstall = opts['allow-install'] || 'prompt';

  // if the targets member is not an array, then wrap it in one
  if (! Array.isArray(targets)) {
    targets = [targets];
  }

  // iterate through the target paths and replace backslashes with forward slashes
  // as per the node in node-glob docs: https://github.com/isaacs/node-glob#windows
  targets = targets.map(function(target) {
    return (target || '').replace(process.cwd() + '\\', '').replace(/\\/g, '/');
  });

  debug('interleave build requested, input globs: ', targets);
  async.concat(targets, glob, function(err, sources) {
    debug('found sources: ', sources);

    // process each of the specified files
    async.forEach(
      sources,
      function(source, itemCallback) {
        var sourceExt = path.extname(source),

            // initialise the target extension (by default converting .coffee => .js, .styl => .css, etc)
            targetExt = transpileTargets[sourceExt.slice(1)] || sourceExt,

            // create a builder for the file
            rigger = builder.createRigger(source, targetExt, opts),

            // initialise the wrappers as per the opts
            // if the target ext is not .js, reset the wrapping types to an empty list
            wrappers = (targetExt === '.js' ? opts.wrap : null) || [''];

        // rig the target for each of the specified packages
        // running in series so the output makes sense
        async.forEach(wrappers, rigger, itemCallback);
      },

      callback
    );
  });
}

// initialise the reporter with the rules
reporter.addRules(require('./lib/reporter-rules'));

module.exports = interleave;
