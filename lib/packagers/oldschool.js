var fs = require('fs'),
    _ = require('underscore');

module.exports = function(targetFile, fileData, callback) {
    // initialise the wrapped content
    var content = fileData.content,
        deps = _.map(fileData.dependencies, function(req) {
            return req.toString();
        });
        
    // parse the content
    content = content + '\n\nglob.' + fileData.module + ' = ' + fileData.module + ';\n';
    content = '(function (glob) {\n' + this._indent(content) + '\n})(this);';
    
    if (deps.length > 0) {
        content = '// dep: ' + deps.join(', ') + '\n\n' + content;
    }
    
    // write the file
    fs.writeFile(targetFile, content, 'utf8', callback);
};