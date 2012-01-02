var async = require('async');

// register the files that can be postprocessed 
exports.extensions = ['.js'];

// define the post processor
exports.process = function(interleaver, files, callback) {
    try {
        var dr = require('dr-js');
        
        // run the post processors
        try {
            dr(files, interleaver.targetPath);
            callback();
        }
        catch (e) {
            callback('error running dr.js: ' + e);
        }
    }
    catch (e) {
        callback('dr-js not available, cannot generate docs');
    }
    
};
