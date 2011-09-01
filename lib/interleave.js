var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    handlers = require('./handlers'),
    reStripExt = /\.\w+$/;
    
function Interleaver(opts) {
    this.targetPath = opts.path;
    this.targetFile = opts.file || 'build.js';
    
    this.sources = [];
} // Interleaver

Interleaver.prototype.include = function(currentFile, target, callback) {
    var interleaver = this,
        basePath = path.dirname(currentFile);
    
    // TODO: check to see if the file has already been loaded

    // load the requested file
    this.load(path.join(basePath, target), function(err, includeData) {
        if (err) {
            if (callback) {
                callback(err);
            } // if
        }
        else {
            interleaver.parse(includeData, function() {
                if (callback) {
                    callback(null, includeData);
                } // if
            });
        } // if..else
    });
}; // include

Interleaver.prototype.load = function(target, callback, includeInOutput) {
    var sources = this.sources;
    
    // check that the file has an extension
    target = target.replace(reStripExt, '') + '.js';
    
    // read the specified file
    fs.readFile(target, 'utf8', function(err, content) {
        if (! err) {
            // initialise the source data
            var sourceData = {
                file: target,
                content: content,
                output: includeInOutput
            };

            // add to the tracked sources
            sources.push(sourceData);
        } // if
        
        // trigger the callback
        callback(err, sourceData);
    });
};

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
            interleaver.load(path.resolve(targetFile), callback, true);
        }, 
        function(err) {
            interleaver.process(function() {
                combiner(interleaver, function(files) {
                    interleaver.write(files);
                });
            });
        }
    );
};