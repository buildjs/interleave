var fs = require('fs'),
    formatter = require('formatter'),
    exportFormatter = formatter('\n\nif (typeof {{ module }} != \'undefined\') { module.exports = {{ module }}; }');

module.exports = function(targetFile, fileData, callback) {
    // initialise the wrapped content
    var deps = [],
        moduleNames = [],
        content = this._extractDeps(fileData.content, deps, moduleNames),
        requireStatements = [];

    // if we have dependencies then add the require statements
    if (deps.length > 0) {
        // add the requires to the top of the content
        deps.forEach(function(dep, index) {
            requireStatements.push(moduleNames[index] + ' = require(\'' + dep + '\')');
        });
        
        content = 'var ' + requireStatements.join(',\n    ') + ';\n\n' + content;
    }
    
    // add the module exports for the module
    content += exportFormatter(fileData);

    // write the file
    fs.writeFile(targetFile, content, 'utf8', callback);
};