exports.extensions = ['.styl'];

exports.process = function(input, callback) {
    var interleave = this;
    
    try {
        // render the stylus css
        require('stylus').render(input.content, { filename: input.file }, function(renderErr, css) {
            if (! renderErr) {
                callback(null, {
                    file: (input.file || '').replace(/\.styl$/, '.css'),
                    content: css
                });
            }
            else {
                callback('could not render: ' + renderErr.message);
            } // if...else
        });
    }
    catch (e) {
        callback('stylus not instaled, could not preprocess file');
    }
};