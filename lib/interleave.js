var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    handlers = require('./handlers');
    
function Interleaver(opts) {
    this.targetPath = opts.out;
    this.sources = [];
} // Interleaver

Interleaver.prototype.load = function(target, callback) {
    var sources = this.sources;
    
    fs.readFile(target, 'utf8', function(err, content) {
        sources.push({
            file: target,
            content: content,
            output: true
        });
        
        callback(err);
    });
};

Interleaver.prototype.parse = function(content, callback) {
    var interleaver = this;
    
    // iterate through each of the handlers, and parse
    async.forEachSeries(
        handlers, 
        function(handler, handlerCallback) {
            handler(interleaver, content, function(updatedContent) {
                // update the content
                content = updatedContent;
                
                // trigger the handler callback
                handlerCallback();
            });
        },
        function(err) {
            if (! err) {
                callback(content);
            } // if
        }
    );
}; // parse

Interleaver.prototype.process = function(callback) {
    var interleaver = this;
    
    // iterate through the source files and load includes
    async.forEach(
        this.sources,
        function(sourceData, processCallback) {
            interleaver.parse(sourceData.content, function(output) {
                sourceData.content = output;
                processCallback();
            });
        },
        callback || function() {}
    );
}; 

Interleaver.prototype.combine = function(target, callback) {
    
}; // combine

Interleaver.prototype.passthrough = function(target, callback) {
    
};

module.exports = function(opts) {
    // initialise options
    opts = opts || {};
    opts.multiaction = opts.multiaction || 'combine';
    
    // initialise variables
    var targetFiles = opts.args || [],
        interleaver = new Interleaver(opts),
        actionHandler = interleaver[opts.multiaction];
    
    // if we don't have the input file specified, then show the help
    if (targetFiles.length === 0) {
        process.stdout.write('No target files specified\n');
        opts.emit('help');
    } // if
    
    // if the action handler is not known, then emit help
    if (! actionHandler) {
        process.stdout.write('Unable to find action handler for action: ' + opts.multiaction + '\n');
        opts.emit('help');
    } // if
    
    // iterate through the target files and read each one
    async.forEachSeries(
        targetFiles, 
        function(targetFile, callback) {
            interleaver.load(targetFile, callback);
        }, 
        function(err) {
            interleaver.process();
        }
    );
};