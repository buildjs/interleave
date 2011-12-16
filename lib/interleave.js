var debug = require('debug')('interleave'),
    fs = require('fs'),
    path = require('path'),
    events = require('events'),
    util = require('util'),
    url = require('url'),
    async = require('async'),
    out = require('out'),
    handlers = require('./handlers'),
    loaders = require('./loaders'),
    preprocessors = require('./preprocessors'),
    reStripExt = /\.(js)$/i,
    supportedExtensions = ['.js', '.css'];
    
// add preprocessors to the supported extensions
for (var prekey in preprocessors) {
    if (preprocessors.hasOwnProperty(prekey)) {
        supportedExtensions.push(prekey);
    } 
}

function fakePreprocessor(sourceData, callback) {
    // pass the content straight through
    callback(null, sourceData);
} // fakePreprocessor
    
function loadConfig(interleaver, opts, callback) {
    // if we have a configuration passed in via the options, then use that
    if (opts.config) {
        interleaver.configure(opts.config, callback);
    }
    // otherwise attempt to load a configuration file
    else {
        // get the target path
        out('looking for optional build configuration file: ' + interleaver.configFile);

        path.exists(interleaver.configFile, function(exists) {
            // if we have config file, then load and parse it
            if (exists) {
                fs.readFile(interleaver.configFile, 'utf8', function(err, data) {
                    try {
                        if (err) {
                            throw new Error(err);
                        } // if

                        // configure the interleaver
                        interleaver.configure(JSON.parse(data), callback);
                    }
                    catch (e) {
                        console.warn('Error loading build.json configuration, default config used'.red());
                        callback();
                    } // try..catch
                });
            }
            // otherwise, trigger the callback
            else {
                callback();
            } // if..else
        });
    }
} // loadConfig
    
function Interleaver(opts) {
    this.targetPath = path.resolve(opts.path || '.');
    this.targetFile = opts.out || 'out.js';
    this.configFile = path.resolve(opts.config || 'build.json');
    
    // set the basedir that will be passed to the path.resolve when looking for files
    this.basedir = opts.basedir;
    
    this.writeables = [];
    this.aliases = [];
    this.loadedTargets = {};
} // Interleaver

util.inherits(Interleaver, events.EventEmitter);

/**
## _cache
*/
Interleaver.prototype._cache = function(key, data) {
    this.loadedTargets[key] = data;
};

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

/**
## configure
*/
Interleaver.prototype.configure = function(configuration, callback) {
    var aliases = configuration.aliases,
        key;
    
    // iterate through the aliases and convert into regular expressions
    if (aliases) {
        for (key in aliases) {
            this.aliases.push({
                regex: new RegExp('^' + key + '\!(.*)$'),
                val: aliases[key]
            });
        } // for
    } // if
    
    // fire the callback
    callback();
}; // configure

/**
## expandPaths
The expandPaths method is used to take the input paths that have been supplied to 
interleaver and convert them to the discrete list of javascript files that was implied.
For instance, if a directory was supplied then this should be expanded to the .js files
that exist within the directory (without recursing into child directories).
*/
Interleaver.prototype.expandPaths = function(paths, callback) {
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
                        var ext = path.extname(file);
                        
                        if (supportedExtensions.indexOf(ext) >= 0) {
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
}; // expandPath

Interleaver.prototype.include = function(current, target, defaultExt, callback) {
    var loaderType = 'file', 
        loader,
        interleaver = this,
        aliasTarget = this._checkAliases(target),
        aliasUsed = target !== aliasTarget,
        targetParts = aliasTarget.split('?'),
        targetExt = path.extname(targetParts[0]),
        preprocessor = preprocessors[targetExt] || fakePreprocessor,
        targetUrl,
        cacheKey;
        
    // get the target into a consistent format
    target = targetParts[0] + (supportedExtensions.indexOf(targetExt) >= 0 ? '' : defaultExt) + 
        ((targetParts.length > 1) ? '?' + targetParts.slice(1).join('?') : '');
    
    // parse the target into a url object
    targetUrl = url.parse(target, true);
    
    // if the target url has a protocol part, then update the loader type
    if (targetUrl.protocol) {
        loaderType = targetUrl.protocol.slice(0, targetUrl.protocol.length - 1);
    } // if
    
    // initialise the cache key
    cacheKey = targetUrl.protocol ? target : current + ':' + target;

    // if the key is in the loaded targets, then return that content
    if (this.loadedTargets[cacheKey]) {
        callback(null, this.loadedTargets[cacheKey]);
        return;
    } // if

    debug('including: ' + target);

    // use the requested loader type and falling back to a file loader
    loader = loaders[loaderType] || loaders.file;
    
    // load the requested file
    loader(this, aliasUsed ? null : current, targetUrl, function(err, includeData) {
        if (err) {
            if (callback) {
                callback(err);
            } // if
        }
        else {
            // set include to default data if nothing has been passed back
            // you know we're cruisy like that
            includeData = includeData || { content: '' };
            
            out('!{yellow}parsing:!{}     ' + target);
            
            // parse the include data
            interleaver.parse(includeData, function() {
                // run the preprocessor
                preprocessor.call(interleaver, includeData, function(preprocessErr, processedData) {
                    if (! preprocessErr) {
                        // update loaded targets cache
                        interleaver._cache(cacheKey, processedData);
                    } // if

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

Interleaver.prototype.process = function(callback) {
    var interleaver = this;
    
    // iterate through the source files and load includes
    async.forEach(
        this.writeables,
        function(sourceData, processCallback) {
            interleaver.parse(sourceData, processCallback);
        },
        callback || function() {}
    );
}; 

Interleaver.prototype.write = function(files, callback) {
    var outputPath = this.targetPath,
        expectedCount = files.length,
        outputFiles = [];

    files.forEach(function(fileData) {
        var targetFile = path.join(outputPath, fileData.file);
        
        out('!{magenta}write:!{}       ' + targetFile);
        fs.writeFile(targetFile, fileData.content, 'utf8', function(err) {
            expectedCount -= 1;
            
            if (err) {
                console.error('Error writing: ' + targetFile);
            }
            else {
                outputFiles.push(targetFile);
            }
            
            if (expectedCount <= 0 && callback) {
                callback(outputFiles);
            }
        });
    });
}; // write

module.exports = function(targetFiles, opts) {
    // initialise options
    opts = opts || {};
    opts.multi = opts.multi || 'concat';
    
    // initialise variables
    var interleaver = new Interleaver(opts),
        combiner = require('./combiners')[opts.multi];
        
    // be tolerant of someone providing a string rather than an array
    if (typeof targetFiles == 'string') {
        targetFiles = [targetFiles];
    } // if

    // if we don't have the input file specified, then show the help
    if (targetFiles.length === 0) {
        return 'No target files specified';
    } // if
    
    // if the action handler is not known, then emit help
    if (! combiner) {
        return 'Unable to find multi handler: ' + opts.multi;
    } // if
    
    // load the interleaver config
    loadConfig(interleaver, opts, function() {
        interleaver.expandPaths(targetFiles, function(err, files) {
            // iterate through the target files and read each one
            async.forEachSeries(
                files, 
                function(file, callback) {
                    interleaver.include(null, file, '.js', function(err, sourceData) {
                        // include this in the list of files to be saved
                        if (! err) {
                            interleaver.writeables.push(sourceData);
                        }
                        else {
                            out('!{error}error:!{}\t' + err);
                        }

                        // trigger the callback
                        callback(null, sourceData);
                    });
                }, 
                function(err) {
                    if (! err) {
                        interleaver.process(function() {
                            combiner(interleaver, function(files) {
                                interleaver.write(files, function(outputFiles) {
                                    try {
                                        require('dr-js')(outputFiles, interleaver.targetPath, function(status) {
                                            out('!{grey}dr.js:!{}\t' + status);
                                        });
                                    }
                                    catch (e) {
                                        /*
                                        console.log('docs:    '.grey + 'Interleave integrates with dr.js: ' + 
                                            'https://github.com/DmitryBaranovskiy/dr.js'.underline);
                                        */
                                    }
                                });
                            });
                        });
                    } // if
                }
            );
        });
    });
    
    return interleaver;
};