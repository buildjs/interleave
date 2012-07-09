var async = require('async'),
    findme = require('findme'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    rigger = require('rigger'),
    _ = require('underscore'),
    templateOpts = {
      interpolate : /\{\{(.+?)\}\}/g
    };

exports.createRigger = function(target, opts) {
    return function(packageType, callback) {
        var findresults,
            output,
            targetFile = path.join(opts.output, packageType, target.replace(opts.sourcePath, '')),
            wrapper,
            wrapperPath = path.resolve(__dirname, '..', 'packagers', 'templates', (packageType || 'nowrap') + '.js'),
            packager = require('../packagers/' + (packageType || 'nowrap')),
            moduleName = path.basename(target, path.extname(target)),
            riggerOpts = _.extend({}, opts, {
                settings: {
                    filename: path.basename(target),
                    moduleName: moduleName,
                    moduleExport: moduleName,
                    packageType: packageType
                }
            });
            
        // read the file
        fs.readFile(wrapperPath, 'utf8', function(err, wrapperText) {
            // if this is not a valid packagetype, then return an error
            if (err) return callback(new Error('Unable to wrap using the "' + packageType + '" packageType'));

            // rig the file
            rigger(target, riggerOpts, function(err, output) {
                // if we hit an error rigger, then return
                if (err) return callback(err);
        
                // make the output file, then write the output
                mkdirp(path.dirname(targetFile), function(err) {
                    if (err) return callback(new Error('Unable to create directory for outputfile: ' + targetFile));

                    // find the dependencies within the output
                    findresults = findme(output);
        
                    // generate the output using the formatter
                    output = _.template(wrapperText, packager(findresults, riggerOpts));

                    // create the output file
                    fs.writeFile(targetFile, output, 'utf8', callback);
                });
            });
        });
    };
};