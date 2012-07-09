var async = require('async'),
    findme = require('findme'),
    path = require('path'),
    rigger = require('rigger');

exports.createRigger = function(target, opts) {
    return function(packageType, callback) {
        var targetFile = path.join(opts.output, packageType, target.replace(opts.sourcePath, ''));
        
        rigger(target, opts, function(err, output) {
            var findresults;
            
            // if we hit an error rigger, then return
            if (err) return callback(err);
            
            // find the dependencies within the output
            findresults = findme(output);
            
            // create the output file
        });
    };
};