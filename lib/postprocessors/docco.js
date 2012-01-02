var async = require('async');

// register the files that can be postprocessed 
exports.extensions = ['.js'];

// define the post processor
exports.process = function(interleaver, files, callback) {
    try {
        var docco = require('docco');
        
        // run the post processors
        try {
            async.forEach(files, docco.generate_documentation, callback);
        }
        catch (e) {
            callback('error running docco: ' + e);
        }
    }
    catch (e) {
        callback('docco not available, cannot generate docs');
    }
    
};
