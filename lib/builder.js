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
    addmeta = require('./addmeta'),
    resolver = require('./resolver');

// have the reporter watch the builder    
reporter.watch(builder);

exports.createRigger = function(source, targetExt, opts) {
    // ensure we have opts
    opts = opts || {};
    
    debug('creating rigger instance for source: ' + source);
    
    function getTargetFile(packageType, opts) {
        var targetTemplate = opts.targetTemplate;
    
        // initialise the target template
        if (! targetTemplate) {
            // initialise to the default template
            targetTemplate = '<%= filename %><%= ext %>';
    
            // if we are wrapping and have more than one package type add the package type
            if (Array.isArray(opts.wrap) && opts.wrap.length > 1) {
                targetTemplate = '<%= packageType %><%= sep %>' + targetTemplate;
            }
        }
    
        return path.resolve(opts.output, opts.targetFilename || _.template(targetTemplate, {
            packageType: packageType,
            filename: path.basename(source, path.extname(source)),
            ext: targetExt,
            sep: path.sep || opts.sep || '/'
        }));
    }
    
    return function(packageType, callback) {
        // ensure the packageType is properly defined
        // if opts.plain specified, use the plain template
        // if opts.resolve specified, use the glob template (really doesn't make sense in umd / amd / commonjs
        // otherwise, fall back to the umd template
        packageType = packageType || (opts.plain ? 'plain' : (opts.resolve ? 'glob' : 'umd'));
        
        // initialise variables
        var output,
            initialFindResults,
            relTarget = source.replace(opts.sourcePath, ''),
            sourceExt = path.extname(source),
            wrapper,            
            wrapperPath = path.resolve(__dirname, 'templates', 'packagers', packageType) + targetExt,
            packager,
            moduleName = path.basename(source, sourceExt),
            rig,
            riggerOpts = _.extend({}, opts, {
                targetType: targetExt,
                tolerant: true,
                settings: {
                    filename: path.basename(source),
                    moduleName: moduleName,
                    moduleExport: moduleName,
                    packageType: packageType,
                    platform: packageType
                }
            }),
            overrideOpts = {},
            targetFile;
            
        // read the wrapper
        debug('reading package template: ' + wrapperPath);
        fs.readFile(wrapperPath, 'utf8', function(err, wrapperText) {
            if (err) return callback(new Error('No ' + packageType + ' template @ ' + wrapperPath));
            
            // ensure we have wrapper text (in the case of non-packaged files we need a default)
            wrapperText = wrapperText || '<%= content %>';
            
            // emit the build package message
            builder.emit('build:package', source, packageType);
            
            // rig the file
            debug('rigging source file: ' + source);
            rig = rigger(source, riggerOpts, function(err, output, settings) {
                // release rig from the reporter
                reporter.release(rig);
                
                // if we hit an error rigger, then return
                if (err) {
                    builder.emit('build:error', targetFile, packageType, err);
                    return callback(err);
                }
                
                // update the in the original rigger opts settings
                _.extend(riggerOpts.settings, settings, {
                    // if the module name has been updated, but the module export still matches the original
                    // name then update this to match the updated name
                    moduleExport: settings.moduleName !== moduleName && settings.moduleExport === moduleName ? 
                        settings.moduleName : 
                        settings.moduleExport
                });
                
                // get the initial find results
                initialFindResults = findme(output);
                
                // initialise the packager
                packager = require('./packagers/' + packageType);

                // initialise the target file
                targetFile = getTargetFile(packageType, _.extend({}, opts, overrideOpts));
                
                // run the resolver to resolve external dependencies (if --resolve specified)
                resolver(builder, initialFindResults, targetFile, opts, function(err, findresults) {
                    // if we received an error, then abort
                    if (err) return callback(err);
                    
                    // generate the output using the formatter
                    output = _.template(wrapperText, packager(findresults, riggerOpts));
                    
                    // make the output file, then write the output
                    mkdirp(path.dirname(targetFile), function(err) {
                        if (err) return callback(new Error('Unable to create directory for outputfile: ' + targetFile));
                        
                        // add the metadata
                        addmeta(output, riggerOpts, findresults.dependencies, function(err, fullOutput) {
                            if (err) return callback(err);
                            
                            // create the output file
                            fs.writeFile(targetFile, fullOutput, 'utf8', callback);
                            
                            // emit the build complete event
                            builder.emit('build:complete', targetFile, packageType);
                        });
                    });
                });
            });
            
            // let the reporter filter events
            reporter.watch(rig);
        });
    };
};