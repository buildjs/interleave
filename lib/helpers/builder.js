var async = require('async'),
    events = require('events'),
    builder = new events.EventEmitter(),
    debug = require('debug')('interleave'),
    findme = require('findme'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    reporter = require('reporter'),
    rigger = require('rigger'),
    _ = require('underscore'),
    templateOpts = {
      interpolate : /\{\{(.+?)\}\}/g
    };

// have the reporter watch the builder    
reporter.watch(builder);

exports.createRigger = function(target, opts) {
    return function(packageType, callback) {
        var findresults,
            output,
            relTarget = target.replace(opts.sourcePath, ''),
            targetFile = path.join(opts.output, packageType, relTarget),
            wrapper,
            wrapperPath = path.resolve(__dirname, '..', 'packagers', 'templates', (packageType || 'plain') + '.js'),
            packager = require('../packagers/' + (packageType || 'plain')),
            moduleName = path.basename(target, path.extname(target)),
            rig,
            riggerOpts = _.extend({}, opts, {
                tolerant: true,
                settings: {
                    filename: path.basename(target),
                    moduleName: moduleName,
                    moduleExport: moduleName,
                    packageType: packageType || 'plain'
                }
            });
            
        builder.emit('build:package', targetFile, packageType);
            
        // read the wrapper
        fs.readFile(wrapperPath, 'utf8', function(err, wrapperText) {
            // if this is not a valid packagetype, then return an error
            if (err) return callback(new Error('Unable to wrap using the "' + packageType + '" packageType'));
            
            // rig the file
            rig = rigger(target, riggerOpts, function(err, output) {
                // release rig from the reporter
                reporter.release(rig);
                
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
                    
                    // emit the build complete event
                    builder.emit('build:complete', targetFile, packageType);
                });
            });
            
            // let the reporter filter events
            reporter.watch(rig);
        });
    };
};