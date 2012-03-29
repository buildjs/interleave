var fs = require('fs');

module.exports = function(targetFile, fileData, callback) {
    fs.writeFile(targetFile, fileData.content, 'utf8',  callback);
};