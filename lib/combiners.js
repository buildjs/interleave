var path = require('path');

exports.concat = function(interleaver, writeables, opts, callback) {
    var output = {
        file: opts.output || 'dist.js',
        content: ''
    };
    
    // iterate through each of the files and combine into a single output file
    writeables.forEach(function(data) {
        output.content += data.content + '\n';
    });
    
    if (callback) {
        callback([output]);
    } // if
};

exports.pass = function(interleaver, writeables, opts, callback) {
    var outputFiles = [],
        basePath = path.resolve('.'),
        minDepth = Infinity;
        
    // determine the min depth of the writeables
    writeables.forEach(function(data) {
        minDepth = Math.min(minDepth, data.file.split('/').length);
    });
    
    // iterate through each of the files and combine into a single output file
    writeables.forEach(function(data) {
        // seperate into file parts
        var fileParts = data.file.split('/'),
            startPart = fileParts.length - (fileParts.length - minDepth) - 1,
            targetFile = fileParts.slice(startPart).join('/');
            
        outputFiles.push({
            file: targetFile,
            content: data.content
        });
    });
    
    if (callback) {
        callback(outputFiles);
    } // if
}; // none