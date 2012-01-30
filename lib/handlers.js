var path = require('path'),
    out = require('out'),
    includePatterns = [
        {
            regex: /^(.*)(\/\/\=\s+)(.*)/m,
            defaultExt: '.js'
        },
        
        {
            regex: /^(.*)(\/\*\=\s+)(.*?)\s*\*\//m,
            defaultExt: '.css'
        },
        
        {
            regex: /^(.*)(\#\=\s+)(.*)/m,
            defaultExt: '.coffee'
        }
    ],
    reQuotesLeadAndTrail = /(^[\"\']|[\"\']$)/g;

function includeSources(interleaver, sourceData, callback) {
    var content = sourceData.content || '',
        match, filename, includedContent,
        defaultExt = '.js';
    
    // run the regular expressions in order   
    for (ii = 0; ii < includePatterns.length; ii++) {
        match = includePatterns[ii].regex.exec(content);
        if (match) {
            defaultExt = includePatterns[ii].defaultExt;
            break;
        }
    }
        
    if (match) {
        filename = match[3].replace(reQuotesLeadAndTrail, '');
        includedContent = '';
        
        interleaver.include(sourceData.file, filename, defaultExt, function(err, includeData) {
            if (! err) {
                // indent the included content
                var includedLines = includeData.content.split(/\n/);

                includedLines.forEach(function(line) {
                    includedContent += match[1] + line + '\n';
                });
            }
            else {
                out(includedContent = '//! INCLUDE FAILED: ' + match[3]);
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

module.exports = [
    // define the standard //= handler
    includeSources
];