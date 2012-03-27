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
    reMacroSingleline = /^(.*)(\/\/\@)(\w+)(.*)/m,
    reMacroMultiline = /^(.*)(\/\*\@)(\w+)(.*?)\s*\*\//m,
    macroPatterns = {
        js: [reMacroSingleline, reMacroMultiline],
        css: [reMacroMultiline],
        coffee: [(/^(.*)(\#\@)(\w+)(.*)/m)]
    },
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
            // if the included data is a string, then convert to an object
            if (typeof includeData == 'string' || (includeData instanceof String)) {
                includeData = {
                    content: includeData
                };
            }
            
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

function expandMacros(interleaver, sourceData, callback) {
    // get the file extension of the source data file
    var ext = path.extname(sourceData.file).slice(1),
        patterns = macroPatterns[ext] || [],
        content = sourceData.content || '';
        
    patterns.forEach(function(regex) {
        var match = regex.exec(content);
        
        while (match) {
            var macro = match[3],
                args = (match[4] || '').replace(/^\s*/, '').split(/\s/),
                handler,
                output = '';
                
            // try and include the macro processor
            try {
                handler = require('./macros/' + macro);
                output = handler.apply(null, [interleaver].concat(args));
            }
            catch (e) {
                // do nothing macro will be removed as the output is already blank
            }
            
            // replace the content 
            content = content.slice(0, match.index) + match[1] + output + 
                content.slice(match.index + match[0].length); 
            
            match = regex.exec(content); 
        }
    });
    
    // update the source data content
    sourceData.content = content;
    
    // trigger the callback
    callback();
} // expandMacros

module.exports = [
    // define the standard //= handler
    includeSources,
    expandMacros
];