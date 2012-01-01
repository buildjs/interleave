var debug = require('debug')('interleave'),
    fs = require('fs'),
    path = require('path'),
    out = require('out'),
    files = fs.readdirSync(__dirname),
    preprocessors = [];
    
function reportNoExtension(extension, packageName) {
    return function(targetFile, callback) {
        callback('could not load ' + extension + ', install via npm: npm install ' + (packageName || extension));
    };
} // reportNoExtension

// look for javascript files in this folder
files.forEach(function(file) {
    var moduleName = path.basename(file, '.js'),
        module;
    
    // if we are dealing with a javascript file, and it's not this file
    // then it's a possible preprocessor
    if (path.extname(file) === '.js' && moduleName !== 'index') {
        try {
            // now include the preprocessor and assign as an export
            preprocessors.push(require('./' + moduleName));
            out('Registered preprocessor: !{underline}' + moduleName);
        }
        catch (e) {
            debug('could not load module: ' + moduleName, e);
        }
    }
});

module.exports = preprocessors;