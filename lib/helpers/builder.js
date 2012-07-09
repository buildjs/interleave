var path = require('path'),
    rigger = require('rigger');

exports.createRigger = function(target, opts) {
    return function(packageType, callback) {
        var targetFile = path.join(opts.output, packageType, target.replace(opts.sourcePath, ''));
        
        console.log(targetFile, packageType);
        callback(null, '');
    };
}