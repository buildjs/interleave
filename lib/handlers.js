var reInclude = /^(.*)(\/\/\=\s*)(\w.*)/m;

module.exports = [];

function includeSources(interleaver, content, callback) {
    var match = reInclude.exec(content);
    if (match) {
        content = content.slice(0, match.index) + content.slice(match.index + match[0].length);
        
        includeSources(interleaver, content, callback);
    }
    else if (callback) {
        callback(content);
    } // if
} // includeSources

// define the standard //= handler
module.exports.push(includeSources);