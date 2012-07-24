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
    _ = require('underscore');

// have the reporter watch the builder    
reporter.watch(builder);

exports.createRigger = function(source, targetExt, opts) {
    return function(packageType, callback) {
        var findresults,
            output,
            relTarget = source.replace(opts.sourcePath, ''),
            sourceExt = path.extname(source),
            
            // initialise the target file name for the source file that will be created
            targetFile = path.basename(source, sourceExt) + targetExt,
            wrapper,
            wrapperPath = path.resolve(__dirname, '..', 'packagers', 'templates', (packageType || 'plain')) + targetExt,
            packager = require('../packagers/' + (packageType || 'plain')),
            moduleName = path.basename(source, sourceExt),
            rig,
            riggerOpts = _.extend({}, opts, {
                targetType: targetExt,
                tolerant: true,
                settings: {
                    filename: path.basename(source),
                    moduleName: moduleName,
                    moduleExport: moduleName,
                    packageType: packageType || 'plain',
                    platform: packageType || 'plain'
                }
            });
            
        if ((! opts.wrap) || opts.wrap.length === 1) {
            targetFile = path.resolve(opts.output, targetFile);
        }
        else {
            targetFile = path.resolve(opts.output, packageType, targetFile);
        }
            
        // read the wrapper
        fs.readFile(wrapperPath, 'utf8', function(err, wrapperText) {
            // if we didn't find a wrapper and we have a specific package type to load
            // then report warning (and only if .js)
            if (err && packageType && targetExt === '.js') {
                builder.emit('warn:package', targetFile, packageType);
                return callback();
            }
            
            // ensure we have wrapper text (in the case of non-packaged files we need a default)
            wrapperText = wrapperText || '<%= content %>';
            
            // emit the build package message
            builder.emit('build:package', targetFile, packageType);
            
            // rig the file
            rig = rigger(source, riggerOpts, function(err, output, settings) {
                // release rig from the reporter
                reporter.release(rig);
                
                // if we hit an error rigger, then return
                if (err) return callback(err);
                
                // update the in the original rigger opts settings
                _.extend(riggerOpts.settings, settings, {
                    // if the module name has been updated, but the module export still matches the original
                    // name then update this to match the updated name
                    moduleExport: settings.moduleName !== moduleName && settings.moduleExport === moduleName ? 
                        settings.moduleName : 
                        settings.moduleExport
                });
                
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