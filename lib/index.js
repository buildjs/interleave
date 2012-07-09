var async = require('async'),
    builder = require('./helpers/builder'),
    path = require('path');

function interleave(targets, opts, callback) {
    // generate the filename and packaging combinations
        
    
    // remap opts if required
    if (typeof opts == 'function') {
        callback = opts;
        opts = {};
    }
    
    // process each of the specified files
    async.forEach(
        targets,
        function(target) {
            // create a builder for the file
            var rigger = builder.createRigger(target, opts);
            
            // rig the target for each of the specified packages
            async.map(opts.wrap || [''], rigger, function(err, results) {
                
            });
        },
        
        callback
    );
}

module.exports = interleave;