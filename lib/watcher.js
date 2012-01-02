var events = require('events'),
    fs = require('fs'),
    hash_file = require('hash_file'),
    util = require('util'),
    path = require('path'),
    out = require('out'),
    _hashes = {};

function Watcher(interleaver, files, opts) {
    var watcher = this;
    
    files.forEach(function(file) {
        watcher.monitor(interleaver, file);
    });
} // Watcher

util.inherits(Watcher, events.EventEmitter);

Watcher.prototype.monitor = function(interleaver, file) {
    var watcher = this;
    
    out('!{grey}watching:!{}    ' + file);
    fs.watch(file, function(evt) {
        // get a hash of the file, and if it is different, then flag the change event
        hash_file(file, 'md5', function(err, hash) {
            if ((! err) && hash !== _hashes[file]) {
                _hashes[file] = hash;
                
                out('!{yellow}changed:     ' + file + ', md5 hash = ' + hash);
                
                // if the interleaver is processing, then wait for it to be done
                if (interleaver.processing) {
                    out('!{yellow}busy:        interleaver currently processing, will flag change once done');
                    interleaver.once('done', function() {
                        watcher.emit('change', file);
                    });
                }
                else {
                    watcher.emit('change', file);
                }
            }
        });
    });
};

module.exports = function(interleaver, files, opts) {
    return new Watcher(interleaver, files, opts);
};