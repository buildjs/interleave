var async = require('async'),
    builder = require('./helpers/builder'),
    debug = require('debug')('interleave'),
    glob = require('glob'),
    path = require('path'),
    reporter = require('reporter'),
    squirrel = require('squirrel');

function interleave(targets, opts, callback) {
    // update the squirrel all install options
    squirrel.defaults.allowInstall = opts['allow-install'] || 'prompt';
    
    // remap opts if required
    if (typeof opts == 'function') {
        callback = opts;
        opts = {};
    }
    
    // if the targets member is not an array, then wrap it in one
    if (! Array.isArray(targets)) {
        targets = [targets];
    }   
    
    debug('interleave build requested, input globs: ', targets);
    async.concat(targets, glob, function(err, sources) {
        debug('found sources: ', sources);

        // process each of the specified files
        async.forEach(
            sources,
            function(source, itemCallback) {
                // create a builder for the file
                var rigger = builder.createRigger(source, opts);

                // rig the target for each of the specified packages
                // running in series so the output makes sense
                async.forEachSeries(opts.wrap || [''], rigger, itemCallback);
            },

            callback
        );
    });
}

// initialise the reporter with the rules
reporter.addRules(require('./helpers/reporter-rules'));

module.exports = interleave;