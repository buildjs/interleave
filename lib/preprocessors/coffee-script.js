var coffeescript = require('coffee-script');

exports.extensions = ['.coffee'];
exports.process = function(input, callback) {
    try {
        callback(null, {
            file: (input.file || '').replace(/\.coffee$/, '.js'),
            content: coffeescript.compile(input.content)
        });
    }
    catch (e) {
        callback('compile error: ' + e.message);
    } // try..catch
};