var path = require('path'),
    reInclude = /^(.*)(\/\/\=\s*)(.*)/m;

module.exports = [];

function includeSources(interleaver, sourceData, callback) {
    var content = sourceData.content || '',
        match = reInclude.exec(content),
        includedContent;
        
    if (match) {
        includedContent = '';
        interleaver.include(sourceData.file, match[3], function(err, includeData) {
            if (! err) {
                // indent the included content
                var includedLines = includeData.content.split(/\n/);

                includedLines.forEach(function(line) {
                    includedContent += match[1] + line + '\n';
                });
            }
            else {
                console.warn(includedContent = '//! INCLUDE FAILED: ' + match[3]);
            } // if..else
            
            // update the content
            sourceData.content = content.slice(0, match.index) + 
                includedContent + content.slice(match.index + match[0].length);

            // go again
            includeSources(interleaver, sourceData, callback);
        });
    }
    else if (callback) {
        callback();
    } // if
} // includeSources

// define the standard //= handler
module.exports.push(includeSources);