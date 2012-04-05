var async = require('async'),
    fs = require('fs'),
    path = require('path'),
    out = require('out'),
    uglify = require('uglify-js');

// register the files that can be postprocessed 
exports.extensions = ['.js'];

// define the post processor
exports.process = function(interleaver, files, callback) {
    // run the post processors
    async.forEach(files, function(item, itemCallback) {
        // read the file
        fs.readFile(item, 'utf8', function(err, data) {
            if (err) {
                itemCallback(err);
            }
            else {
                out('!{grey}uglifying:!{}   '  + item);
                
                try {
                    // mangle squeeze and generate the compressed code
                    fs.writeFile(
                        path.join(path.dirname(item), path.basename(item, '.js') + '.min.js'), 
                        uglify(data), 
                        'utf8',
                        itemCallback
                    );
                }
                catch (e) {
                    itemCallback('error uglifying source: ' + e);
                }
            }
        });
    }, callback);
};
