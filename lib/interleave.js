var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    async = require('async'),
    handlers = require('./handlers'),
    loaders = require('./loaders'),
    reStripExt = /\.(js)/i;
    
function Interleaver(opts) {
    this.targetPath = opts.path;
    this.targetFile = opts.file || 'build.js';
    
    this.sources = [];
} // Interleaver

Interleaver.prototype.include = function(current, target, callback) {
    var loaderType = 'file', 
        loader,
        interleaver = this,
        targetParts = target.split('?'),
        targetUrl;
        
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
    
    // iterate through the target files and read each one
    async.forEachSeries(
        targetFiles, 
        function(targetFile, callback) {
            interleaver.include(null, path.resolve(targetFile), function(err, sourceData) {
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
};