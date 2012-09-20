var async = require('async'),
    builder = require('./lib/helpers/builder'),
    debug = require('debug')('interleave'),
    glob = require('glob'),
    path = require('path'),
    reporter = require('reporter'),
    squirrel = require('squirrel'),
    _ = require('underscore'),
    transpileTargets = {
        styl: '.css',
        coffee: '.js'
    };

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
    if (opts.wrap === 'true' || opts.wrap === true) {
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
reporter.addRules(require('./lib/helpers/reporter-rules'));

module.exports = interleave;