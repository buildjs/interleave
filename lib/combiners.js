exports.concat = function(interleaver, callback) {
    var output = {
        file: interleaver.targetFile,
        content: ''
    };
    
    // iterate through each of the files and combine into a single output file
    interleaver.sources.forEach(function(sourceData) {
        if (sourceData.output) {
            output.content += sourceData.content + '\n';
        } // if
    });
    
    if (callback) {
        callback([output]);
    } // if
};