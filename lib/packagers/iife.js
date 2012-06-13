var fs = require('fs');

module.exports = function(targetFile, fileData, callback) {
    // initialise the wrapped content
    var deps = [],
        content = this._extractDeps(fileData.content, deps);
        
    // parse the content
    content = '(function () {\n' + this._indent(content) + '\n}());';
    
    if (deps.length > 0) {
        content = '// dep: ' + deps.join(', ') + '\n\n' + content;
    }
    
    // write the file
    fs.writeFile(targetFile, content, 'utf8', callback);
};