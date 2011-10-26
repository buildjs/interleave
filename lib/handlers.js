var path = require('path'),
    reSinglelineComment = /^(.*)(\/\/\=\s+)(.*)/m,
    reMultilineComment = /^(.*)(\/\*\=\s+)(.*?)\s*\*\//m,
    reQuotesLeadAndTrail = /(^[\"\']|[\"\']$)/g;

module.exports = [];

function includeSources(interleaver, sourceData, callback) {
    var content = sourceData.content || '',
        match = reSinglelineComment.exec(content) || reMultilineComment.exec(content),
        filename, includedContent;
        
    if (match) {
        filename = match[3].replace(reQuotesLeadAndTrail, '');
        includedContent = '';
        
        interleaver.include(sourceData.file, filename, function(err, includeData) {
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