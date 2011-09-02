var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    async = require('async'),
    handlers = require('./handlers'),
    loaders = require('./loaders'),
    reStripExt = /\.(js)/i;
    
function loadConfig(interleaver, callback) {
    // get the target path
    var configPath = this.targetPath || path.resolve('.'),
        configFile = path.join(configPath, 'build.json');
        
    path.exists(configFile, function(exists) {
        // if we have config file, then load and parse it
        if (exists) {
            fs.readFile(configFile, 'utf8', function(err, data) {
                try {
                    if (err) {
                        throw new Error(err);
                    } // if

                    // configure the interleaver
                    interleaver.configure(JSON.parse(data), function() {
                        callback();
                    });
                }
                catch (e) {
                    console.warn('Error loading build.json configuration, default config used');
                    callback();
                } // try..catch
            });
        }
        // otherwise, trigger the callback
        else {
            callback();
        } // if..else
    });
} // loadConfig
    
function Interleaver(opts) {
    this.targetPath = opts.path;
    this.targetFile = opts.file || 'build.js';
    
    this.sources = [];
    this.aliases = [];
} // Interleaver

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
    var expandedPaths = [];
    
    async.forEach(
        paths,
        function(inputPath, itemCallback) {
            // first attempt to read the path as a directory
            fs.readdir(inputPath, function(err, files) {
                // if it errored, then do an exists check on the file
                if (err) {
                    path.exists(inputPath, function(exists) {
                        if (exists) {
                            expandedPaths.push(inputPath);
                        } // if
                        
                        itemCallback();
                    });
                }
                // otherwise, add each of the .js files in the directory to the expanded paths
                else {
                    files.forEach(function(file) {
                        if (path.extname(file) == '.js') {
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

Interleaver.prototype.include = function(current, target, callback) {
    var loaderType = 'file', 
        loader,
        interleaver = this,
        targetParts,
        targetUrl;

    // check to see if the target is an alias
    for (var ii = 0; ii < this.aliases.length; ii++) {
        var alias = this.aliases[ii];
        
        if (alias.regex.test(target)) {
            target = target.replace(alias.regex, alias.val);
        } // if
    } // for
        
    // break the target into target parts
    targetParts = target.split('?');
        
    // get the target into a consistent format
    target = targetParts[0].replace(reStripExt, '') + '.js' + 
        ((targetParts.length > 1) ? '?' + targetParts.slice(1).join('?') : '');
    
    // TODO: check to see if the file has already been loaded
    
    // parse the target into a url object
    targetUrl = url.parse(target, true);
    
    // if the target url has a protocol part, then update the loader type
    if (targetUrl.protocol) {
        loaderType = targetUrl.protocol.slice(0, targetUrl.protocol.length - 1);
    } // if

    // use the requested loader type and falling back to a file loader
    loader = loaders[loaderType] || loaders.file;

    // load the requested file
    loader(this, current, targetUrl, function(err, includeData) {
        if (err) {
            if (callback) {
                callback(err);
            } // if
        }
        else {
            // set include to default data if nothing has been passed back
            // you know we're cruisy like that
            includeData = includeData || { content: '' };
            
            interleaver.parse(includeData, function() {
                if (callback) {
                    callback(null, includeData);
                } // if
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
    var interleaver = this,
        originalSources = [].concat(this.sources);
    
    // iterate through the source files and load includes
    async.forEach(
        originalSources,
        function(sourceData, processCallback) {
            interleaver.parse(sourceData, processCallback);
        },
        callback || function() {}
    );
}; 

Interleaver.prototype.write = function(files) {
    var outputPath = this.targetPath || path.resolve('.');

    files.forEach(function(fileData) {
        fs.writeFile(path.join(outputPath, fileData.file), fileData.content, 'utf8');
    });
}; // write

module.exports = function(opts) {
    // initialise options
    opts = opts || {};
    opts.combiner = opts.combiner || 'concat';
    
    // initialise variables
    var targetFiles = opts.args || [],
        interleaver = new Interleaver(opts),
        combiner = require('./combiners')[opts.combiner];
    
    // if we don't have the input file specified, then show the help
    if (targetFiles.length === 0) {
        process.stdout.write('No target files specified\n');
        opts.emit('help');
    } // if
    
    // if the action handler is not known, then emit help
    if (! combiner) {
        process.stdout.write('Unable to find combiner: ' + opts.combiner + '\n');
        opts.emit('help');
    } // if
    
    // load the interleaver config
    loadConfig(interleaver, function() {
        interleaver.expandPaths(targetFiles, function(err, jsFiles) {
            // iterate through the target files and read each one
            async.forEachSeries(
                jsFiles, 
                function(jsFile, callback) {
                    interleaver.include(null, path.resolve(jsFile), function(err, sourceData) {
                        // flag as this particular file being included in the output
                        sourceData.output = true;

                        // trigger the callback
                        callback(err, sourceData);
                    });
                }, 
                function(err) {
                    if (! err) {
                        interleaver.process(function() {
                            combiner(interleaver, function(files) {
                                interleaver.write(files);
                            });
                        });
                    } // if
                }
            );
        });
    });
};