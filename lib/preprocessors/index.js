var debug = require('debug')('interleave'),
    fs = require('fs'),
    path = require('path'),
    files = fs.readdirSync(__dirname),
    preprocessors = [];
    
// look for javascript files in this folder
files.forEach(function(file) {
    var moduleName = path.basename(file, '.js'),
        module;
    
    // if we are dealing with a javascript file, and it's not this file
    // then it's a possible preprocessor
    if (path.extname(file) === '.js' && moduleName !== 'index') {
        // now include the preprocessor and assign as an export
        preprocessors.push(require('./' + moduleName));
    }
});

module.exports = preprocessors;