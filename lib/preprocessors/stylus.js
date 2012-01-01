var stylus = require('stylus');

exports.extensions = ['.styl'];
exports.process = function(input, callback) {
    var interleave = this;

    // render the stylus css
    stylus.render(input.content, { filename: input.file }, function(renderErr, css) {
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
};