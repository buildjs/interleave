var async = require('async'),
    builder = require('./helpers/builder'),
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
    
    // process each of the specified files
    async.forEach(
        targets,
        function(target, itemCallback) {
            // create a builder for the file
            var rigger = builder.createRigger(target, opts);
            
            // rig the target for each of the specified packages
            // running in series so the output makes sense
            async.forEachSeries(opts.wrap || [''], rigger, itemCallback);
        },
        
        callback
    );
}

// initialise the reporter with the rules
reporter.addRules(require('./helpers/reporter-rules'));

module.exports = interleave;