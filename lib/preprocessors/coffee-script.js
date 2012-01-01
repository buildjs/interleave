exports.extensions = ['.coffee'];

exports.process = function(input, callback) {
    try {
        var coffeescript = require('coffee-script');
        
        try {
            callback(null, {
                file: (input.file || '').replace(/\.coffee$/, '.js'),
                content: coffeescript.compile(input.content)
            });
        }
        catch (e) {
            callback('compile error: ' + e.message);
        } // try..catch
    }
    catch (e) {
        callback('coffee-script not available, unable to preprocess');
    }
};