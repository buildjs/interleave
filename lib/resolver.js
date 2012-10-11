var async = require('async'),
    debug = require('debug')('interleave'),
    fs = require('fs'),
    path = require('path'),
    squirrel = require('squirrel'),
    mkdirp = require('mkdirp'),
    _ = require('underscore'),
    reLeadingDot = /^\./,
    reTextFiles = /(css|js|html|txt|md|mdown)$/i;

module.exports = function(builder, findresults, targetFile, opts, callback) {
    var targetExt = path.extname(targetFile),
        targetBase = path.join(path.dirname(targetFile), path.basename(targetFile, targetExt));

    // if the resolve option is not set, then pass the findresults straight through
    if (! opts.resolve) return callback(null, findresults);

    // if the repository is not defined, default it to modules from the cwd
    opts.repository = opts.repository || path.resolve('modules');

    squirrel(['resolveme'], function(err, resolveme) {
        if (err) return callback(err);

        // add a resolved content to the findresults object
        findresults.resolvedContent = '';

        debug('resolving dependencies: ' + _.values(findresults.dependencies));
        resolveme(_.values(findresults.dependencies), opts, function(err, bundle) {
            var depsContent = [],
                extraFileTypes = [];

            if (err) return callback(err);

            // add the deps content to the start of the output
            findresults.resolvedContent = resolveme.join([
                bundle.getContent(targetExt), findresults.resolvedContent
            ], targetExt);

            // reset the dependencies to empty
            findresults.dependencies = {};

            // TODO: check for supporting filetypes that need to be pushed to the target location
            extraFileTypes = bundle.fileTypes
                .filter(reTextFiles.test.bind(reTextFiles))
                .filter(function(fileType) {
                    return fileType.toLowerCase() !== targetExt.replace(reLeadingDot, '');
                });
                
            debug('found extra files while resolving dependencies: ', extraFileTypes);

            // write the output for the additional filetypes
            async.forEach(
                extraFileTypes, 
                function(fileType, itemCallback) {
                    var supportingFile = targetBase + '.' + fileType.replace(reLeadingDot, '');

                    // TODO: handle non text types
                    debug('writing supporting file to: ' + supportingFile);
                    
                    // ensure the directory exists
                    mkdirp(path.dirname(supportingFile), function(err) {
                        if (err) return itemCallback(err);
                        
                        fs.writeFile(
                            supportingFile, 
                            bundle.getContent(fileType), 
                            'utf8', 
                            
                            function(err) {
                                if (! err) {
                                    builder.emit('build:extra', supportingFile);
                                }
                        
                                itemCallback(err);
                            }
                        );
                    });
                },

                function(err) {
                    if (err) return callback(err);

                    callback(null, findresults);
                }
            );
        });
    });
};