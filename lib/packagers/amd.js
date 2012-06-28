var fs = require('fs');

module.exports = function(targetFile, fileData, callback) {
    // initialise the wrapped content
    var deps = [],
        moduleNames = [],
        content = this._extractDeps(fileData.content, deps, moduleNames),
        depsString = '[]';
        
    if (deps.length > 0) {
        depsString = '[\'' + deps.join('\', \'') + '\']';
    }
        
    // add the define header
    content = 
        'define(\'' + fileData.module + '\', ' + depsString + ', function(' + moduleNames.join(', ') + ') {\n' +
        this._indent(content) + 
        '\n\n  return ' + fileData.module + ';\n' +
        '});';
        
    // write the file
    fs.writeFile(targetFile, content, 'utf8', callback);
};