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
    transpileTargets = {
        styl: '.css',
        coffee: '.js'
    };

// have the reporter watch the builder    
reporter.watch(builder);

exports.createRigger = function(target, opts) {
    return function(packageType, callback) {
        var findresults,
            output,
            relTarget = target.replace(opts.sourcePath, ''),
            sourceExt = path.extname(target),
            
            // initialise the target extension (by default converting .coffee => .js, .styl => .css, etc)
            targetExt = transpileTargets[sourceExt.slice(1)] || sourceExt,
            
            // initialise the file name for the target file that will be created
            targetFile = path.join(opts.output, packageType, path.basename(target, sourceExt) + targetExt),
            wrapper,
            wrapperPath = path.resolve(__dirname, '..', 'packagers', 'templates', (packageType || 'plain')) + targetExt,
            packager = require('../packagers/' + (packageType || 'plain')),
            moduleName = path.basename(target, sourceExt),
            rig,
            riggerOpts = _.extend({}, opts, {
                targetType: targetExt,
                tolerant: true,
                settings: {
                    filename: path.basename(target),
                    moduleName: moduleName,
                    moduleExport: moduleName,
                    packageType: packageType || 'plain',
                    platform: packageType || 'plain'
                }
            });
            
        // read the wrapper
        fs.readFile(wrapperPath, 'utf8', function(err, wrapperText) {
            // if we didn't find a wrapper and we have a specific package type to load
            // then report warning
            if (err && packageType) {
                builder.emit('warn:package', targetFile, packageType);
                return callback();
            }
            
            // ensure we have wrapper text (in the case of non-packaged files we need a default)
            wrapperText = wrapperText || '<%= content %>';
            
            // emit the build package message
            builder.emit('build:package', targetFile, packageType);
            
            // rig the file
            rig = rigger(target, riggerOpts, function(err, output, settings) {
                // release rig from the reporter
                reporter.release(rig);
                
                // if we hit an error rigger, then return
                if (err) return callback(err);
                
                // update the in the original rigger opts settings
    
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