var async = require('async'),
    debug = require('debug')('interleave'),
    path = require('path'),
    reCommaDelim = /\,\s*/,
    interleave = require('../'),
    squirrel = require('../helpers/squirrel'),
    reGlobPath = /^([^\*]*\/)/;

// action description
exports.desc = 'Build the source files';

exports.args = {
    'sourcePath': path,
    'targetFilename': String,
    'output': path,
    'watch': Boolean,
    'wrap': String,
    'sep': String
};

// export runner
exports.run = function(opts, callback) {
    var sourceGlobs,
        scaffolder = this;
    
    // initialise the opts
    opts = opts || {};
    
    // convert the relative source files into absolute paths
    sourceGlobs = opts.argv.remain.slice();
    
    // if the globs is empty, automatically provide 'src/*.js' and we'll see what we find
    if (sourceGlobs.length === 0) {
        debug('no valid input source globs found, providing defaults. original = ', opts.argv);
        sourceGlobs.push('src/*.js');
    }
    
    // expand the globs relative to the specified path
    sourceGlobs = sourceGlobs.map(function(globSpec) {
        return path.resolve(globSpec);
    });

    // run the interleave interface
    interleave(sourceGlobs, opts, function(err, results) {
        if (err) {
            scaffolder.out('!{red}{0}', err);
        }
    });
};