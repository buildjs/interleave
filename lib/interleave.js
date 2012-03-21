var debug = require('debug')('interleave'),
    fs = require('fs'),
    path = require('path'),
    events = require('events'),
    util = require('util'),
    url = require('url'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    out = require('out'),
    handlers = require('./handlers'),
    loaders = require('./loaders'),
    preprocessors = {},
    postprocessors = require('./postprocessors'),
    reStripExt = /\.(js)$/i,
    reTrailingSlash = /\/$/,
    supportedExtensions = ['.js', '.css'];
    
// add preprocessors to the supported extensions
require('./preprocessors').forEach(function(preprocessor) {
    preprocessor.extensions.forEach(function(ext) {
        preprocessors[ext] = preprocessor.process;
        supportedExtensions.push(ext);
    });
});

/* # Helper Functions */

function fakePreprocessor(sourceData, callback) {
    // pass the content straight through
    callback(null, sourceData);
} // fakePreprocessor

function _compile(interleaver, files, opts) {
    var combiner = require('./combiners')[opts.concat ? 'concat' : 'pass'],
        writeables = [];
    
    // flag the we are currently processing
    interleaver.processing = true;
    
    // iterate through the target files and read each one
    async.forEachSeries(
        files, 
        function(file, callback) {
            out('!{lime}<==          ' + file);
            interleaver.include(null, file, '.js', function(err, sourceData) {
                // include this in the list of files to be saved
                if (! err) {
                    writeables.push(sourceData);
                }
                else {
                    out('!{bold}error:!{red}       ' + err);
                }

                // trigger the callback
                callback(null, sourceData);
            });
        }, 
        function(err) {
            if (! err) {
                interleaver.process(writeables, function() {
                    // combine the files that have been processed by interleave
                    combiner(interleaver, writeables, opts, function(files) {
                        // after combining the files in the required way
                        // write the files to the file system
                        interleaver.write(files, function(outputFiles) {
                            // run the postprocessors
                            postprocessors.run(interleaver, outputFiles, interleaver.after, function() {
                                interleaver.done();
                            });
                        });
                    });
                });
            }
            else {
                interleaver.done();
            }
        }
    );
} // _compile

/*
## _expandPaths
The expandPaths function is used to take the input paths that have been supplied to 
interleaver and convert them to the discrete list of javascript files that was implied.
For instance, if a directory was supplied then this should be expanded to the .js files
that exist within the directory (without recursing into child directories).
*/
function _expandPaths(paths, callback) {
    var expandedPaths = [],
        basedir = this.basedir;
    
    async.forEach(
        paths,
        function(inputPath, itemCallback) {
            debug('expanding path: ' + inputPath);
            
            // resolve the path against the base directory
            var realPath = path.resolve(basedir, inputPath);
            
            // first attempt to read the path as a directory
            fs.readdir(realPath, function(err, files) {
                // if it errored, then do an exists check on the file
                if (err) {
                    path.exists(realPath, function(exists) {
                        if (exists) {
                            debug('found file: ' + realPath);
                            expandedPaths.push(inputPath);
                        } // if
                        
                        itemCallback();
                    });
                }
                // otherwise, add each of the valid files in the directory to the expanded paths
                else {
                    debug('looking for files in: ' + realPath);
                    files.forEach(function(file) {
                        if (supportedExtensions.indexOf(path.extname(file)) >= 0) {
                            expandedPaths.push(path.join(inputPath, file));
                        } // if
                    });
                    
                    // trigger the callback
                    itemCallback();
                }
            });
        },
        function(err) {
            callback(err, expandedPaths);
        }
    );
} // _expandPaths

/*
# Interleaver
The Interleaver is responsible for replacing interleave import statements (`//=`) with
the requested source.
*/
function Interleaver(opts) {
    // ensure we have options
    opts = opts || {};
    
    // set the targetpath file
    this.targetPath = path.resolve(opts.path || '.');
    
    // set the basedir that will be passed to the path.resolve when looking for files
    this.basedir = opts.basedir;
    this.processing = false;
    
    this.aliases = [];
    this.after = opts.after || [];
    this.data = opts.data || {};
    
    // iterate through the aliases and convert into regular expressions
    if (opts.aliases) {
        for (key in opts.aliases) {
            this.aliases.push({
                regex: new RegExp('^' + key + '\!(.*)$'),
                val: opts.aliases[key].replace(reTrailingSlash, '/$1')
            });
        } // for
    } // if
    
    // save the opts to the interleaver so plugins can access them
    this.opts = opts;
} // Interleaver

util.inherits(Interleaver, events.EventEmitter);

Interleaver.prototype._checkAliases = function(target) {
    // check to see if the target is an alias
    for (var ii = 0; ii < this.aliases.length; ii++) {
        var alias = this.aliases[ii];
        
        if (alias.regex.test(target)) {
            target = target.replace(alias.regex, alias.val);
        } // if
    } // for
    
    return target;
}; // _checkAliases

/*
### done
*/
Interleaver.prototype.done = function() {
    this.processing = false;
    this.emit('done');
}; // done

Interleaver.prototype.findPackageData = function(callback) {
    var packageFile = path.resolve(this.basedir, 'package.json'),
        interleaver = this;
    
    fs.readFile(packageFile, 'utf8', function(err, data) {
        if (! err) {
            data = JSON.parse(data);
            
            // iterate through the data and update the interleaver data if not defined
            for (var key in data) {
                if (typeof interleaver.data[key] == 'undefined') {
                    interleaver.data[key] = data[key];
                }
            }
        }
        
        // trigger the callback
        callback();
    });
};

Interleaver.prototype.include = function(current, target, defaultExt, callback) {
    var loaderType = 'file', 
        loader,
        interleaver = this,
        aliasTarget = this._checkAliases(target),
        aliasUsed = target !== aliasTarget,
        targetParts = aliasTarget.split('?'),
        targetExt = path.extname(targetParts[0]),
        preprocessor = preprocessors[targetExt] || fakePreprocessor,
        targetFile, targetUrl,
        cacheKey;
        
    // get the target into a consistent format
    targetFile = targetParts[0] + (supportedExtensions.indexOf(targetExt) >= 0 ? '' : defaultExt) + 
        ((targetParts.length > 1) ? '?' + targetParts.slice(1).join('?') : '');
    
    // parse the target into a url object
    targetUrl = url.parse(targetFile, true);
    
    // if the target url has a protocol part, then update the loader type
    if (targetUrl.protocol) {
        loaderType = targetUrl.protocol.slice(0, targetUrl.protocol.length - 1);
    } // if
    
    // initialise the cache key
    cacheKey = targetUrl.protocol ? targetFile : current + ':' + targetFile;

    // use the requested loader type and falling back to a file loader
    loader = loaders[loaderType] || loaders.file;
    
    // load the requested file
    debug('including: ' + targetFile);
    loader(this, aliasUsed ? null : current, targetUrl, target, function(err, includeData) {
        if (err) {
            if (callback) {
                callback(err);
            } // if
        }
        else {
            // set include to default data if nothing has been passed back
            // you know we're cruisy like that
            includeData = includeData || { content: '' };
            
            out('!{yellow}parsing:!{}     ' + targetFile);
            
            // parse the include data
            interleaver.parse(includeData, function() {
                // run the preprocessor
                preprocessor.call(interleaver, includeData, function(preprocessErr, processedData) {
                    // trigger the callback
                    if (callback) {
                        callback(preprocessErr, processedData);
                    } // if
                });
            });
        } // if..else
    });
}; // include

Interleaver.prototype.parse = function(sourceData, callback) {
    var interleaver = this;
    
    // iterate through each of the handlers, and parse
    async.forEachSeries(
        handlers, 
        function(handler, handlerCallback) {
            handler(interleaver, sourceData, handlerCallback);
        },
        callback
    );
}; // parse

Interleaver.prototype.process = function(writeables, callback) {
    var interleaver = this;
    
    // iterate through the source files and load includes
    async.forEach(
        writeables,
        function(sourceData, processCallback) {
            interleaver.parse(sourceData, processCallback);
        },
        callback || function() {}
    );
}; 

Interleaver.prototype.write = function(files, callback) {
    var outputPath = this.targetPath,
        expectedCount = files.length,
        outputFiles = [],
        opts = this.opts;
        
    async.forEach(
        files,
        function(fileData, itemCallback) {
            var targetFile = path.join(outputPath, fileData.file);

            out('!{cyan}write:!{}       ' + targetFile);
            mkdirp(path.dirname(targetFile), 493 /* 755 */, function() {
                // create the file stream
                var outputStream = fs.createWriteStream(targetFile),
                    targetStream = outputStream;

                if (opts.bake) {
                    var BakeStream = require('bake-js').Stream,
                        baker = targetStream = new BakeStream(opts.bake);

                    // set the basepath for bake resolution
                    baker.basePath = path.basename(targetFile);

                    // pipe from the backer to the output stream
                    baker.pipe(outputStream);
                }

                outputStream.on('error', function(err) {
                    out('!{red}Error writing: ' + targetFile);
                    itemCallback(err);
                });

                outputStream.on('close', function() {
                    outputFiles.push(targetFile);
                    itemCallback();
                });
                
                // write the content to the target stream
                targetStream.write(fileData.content, 'utf8');
                targetStream.end();
            });
        },
        callback
    );
}; // write

exports = module.exports = function(targetFiles, opts) {
    var interleaver;
    
    // initialise options
    opts = opts || {};
    opts.after = opts.after || [];
    
    // if after has been passed in as a string, then split on the comma
    if (typeof opts.after == 'string') {
        opts.after = opts.after.split(/(\,|\+)/);
    }

    // be tolerant of someone providing a string rather than an array
    if (typeof targetFiles == 'string') {
        targetFiles = [targetFiles];
    } // if

    // if we don't have the input file specified, then show the help
    if (targetFiles.length === 0) {
        return 'No target files specified';
    } // if
    
    // create the interleaver
    interleaver = new Interleaver(opts);
    
    // load the local package data
    interleaver.findPackageData(function() {
        _expandPaths(targetFiles, function(err, files) {
            // if we are watching, then create a watcher
            if (opts.watch) {
                require('./watcher')(interleaver, files, opts).on('change', function(file) {
                    _compile(interleaver, [file], opts);
                });
            }
            // otherwise, immediately compile
            else {
                _compile(interleaver, files, opts);
            }
        });
    });
    

    return undefined;
};

exports.compile = _compile;

// export the loaders
exports.loaders = loaders;