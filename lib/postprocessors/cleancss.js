var async = require('async'),
    fs = require('fs'),
    path = require('path'),
    out = require('out');

// register the files that can be postprocessed
exports.extensions = ['.css'];

// define the post processor
exports.process = function(interleaver, files, callback) {
    try {
        var cleanCSS = require('clean-css');

        // run the post processors
        async.forEach(files, function(item, itemCallback) {
            // read the file
            fs.readFile(item, 'utf8', function(err, data) {
                if (err) {
                    itemCallback(err);
                }
                else {
                    out('!{grey}running cleancss:!{}   '  + item);

                    try {
                        // mangle squeeze and generate the compressed code
                        fs.writeFile(
                            path.join(path.dirname(item), path.basename(item, '.css') + '.min.css'),
                            cleanCSS.process(data),
                            'utf8',
                            itemCallback
                        );
                    }
                    catch (e) {
                        itemCallback('error using cleancss source: ' + e);
                    }
                }
            });
        }, callback);
    }
    catch (e) {
        callback('!{underline}clean-css!{} not available, cannot generate docs');
    }

};
