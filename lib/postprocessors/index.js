var debug = require('debug')('interleave'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    files = fs.readdirSync(__dirname),
    postprocessors = {};
    
// ## exports
    
exports.run = function(interleaver, files, selected, callback) {
    // for each of the selected post processors, parse each of the files
    async.forEach(selected, function(item, itemCallback) {
        var processor = postprocessors[item],
            supportedFiles = [];
        
        // if we have the processor then run it
        if (! processor || (! processor.process)) {
            itemCallback('Unable to find postprocessor: ' + item);
        }
        else {
            // get the items that match the supported extensions
            supportedFiles = files.filter(function(file) {
                // include if the processor has not specifically defined supported extensions
                // or the extension of the file is in the array of supported extensions
                return (! processor.extensions) || processor.extensions.indexOf(path.extname(file)) >= 0;
            });
            
            // process the supported files
            processor.process(interleaver, supportedFiles, itemCallback);
        }
    }, callback);
};

// ## Module Initialization

// look for javascript files in this folder
files.forEach(function(file) {
    var moduleName = path.basename(file, '.js'),
        module;
    
    // if we are dealing with a javascript file, and it's not this file
    // then it's a possible preprocessor
    if (path.extname(file) === '.js' && moduleName !== 'index') {
        // now include the preprocessor and assign as an export
        postprocessors[moduleName] = require('./' + moduleName);
    }
});
