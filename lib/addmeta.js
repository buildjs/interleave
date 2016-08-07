var fs = require('fs'),
    debug = require('debug')('interleave'),
    path = require('path'),
    _ = require('underscore'),
    debug = require('debug')('interleave'),
    generatorData = require(path.resolve(__dirname, '..', 'package.json')),
    headerblock = require('headerblock');

function findPackageData(opts) {
    var targetPath = path.resolve(opts.sourcePath),
        lastTargetPath;
    
    // look for the package.json file
    while (! fs.existsSync(path.join(targetPath, 'package.json'))) {
        if (lastTargetPath === targetPath) break;
        
        lastTargetPath = targetPath;
        targetPath = path.dirname(targetPath);
    }
    
    try {
        debug('attempting to include package data from: ' + targetPath);
        return require(path.join(targetPath, 'package.json'));
    }
    catch (e) {
        debug('encountered error attempting to include package data: ', e);
        return {};
    }
}

module.exports = function(output, opts, deps, callback) {
    var packageData,
        packageTitle = opts.settings.moduleExport,
        licenses,
        data;
    
    // if we are in nometa mode, then return the output unchanged
    if (opts.nometa) return callback(null, output);
    
    // get the header data
    data = _.extend(findPackageData(opts), {
        generator: generatorData.name + '@' + generatorData.version
    });
    
    // generate the headerblock
    debug('generating header block for source');
    headerblock(data, opts, function(err, headerdata) {
        if (err) return callback(err);
        
        callback(null, headerdata + output);
    });
};
