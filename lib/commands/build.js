var async = require('async'),
    debug = require('debug')('interleave'),
    glob = require('glob'),
    path = require('path'),
    reCommaDelim = /\,\s*/,
    interleave = require('../'),
    squirrel = require('../helpers/squirrel'),
    reGlobPath = /^([^\*]*\/)/;

// action description
exports.desc = 'Build the source files';

exports.args = {
    'sourcePath': path,
    'output': path,
    'watch': Boolean,
    'wrap': String
};

// export runner
exports.run = function(opts, callback) {
    var sourceGlobs,
        scaffolder = this;
    
    // initialise the opts
    opts = opts || {};
    
    // if wrap is specified, and has defaulted to 'true' (no options specified, then set defaults)
    if (opts.wrap === 'true') {
        opts.wrap = ['', 'amd', 'commonjs', 'glob'];
    }
    
    // set the default path to the cwd
    opts.sourcePath = opts.sourcePath || path.resolve('src');
    opts.output     = opts.output     || path.resolve('dist');
    
    // if we have a wrap option as a string, then split
    if (typeof opts.wrap == 'string' || (opts.wrap instanceof String)) {
        opts.wrap = opts.wrap.split(reCommaDelim);
    }
    
    // convert the relative source files into absolute paths
    sourceGlobs = opts.argv.remain.slice(1).map(function(file) {
        return path.resolve(opts.path, file);
    });

    debug('interleave build requested, input globs: ', sourceGlobs);
    async.concat(sourceGlobs, glob, function(err, sources) {
        interleave(sources, opts, function(err, results) {
            if (err) {
                scaffolder.out('!{red}{0}', err);
            }
        });
    });
};