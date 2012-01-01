exports.extensions = ['.roy'];

exports.process = function(input, callback) {
    try {
        var roy = require('roy');
        
        try {
            var compilationResult = roy.compile(input.content);
            
            callback(null, {
                file: (input.file || '').replace(/\.roy$/, '.js'),
                content: compilationResult.output
            });
        }
        catch (e) {
            callback('compile error: ' + e.message);
        } // try..catch
    }
    catch (e) {
        callback('roy not available, unable to preprocess');
    }
};