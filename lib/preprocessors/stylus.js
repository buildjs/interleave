exports.extensions = ['.styl'];

exports.process = function(input, callback) {
    var interleave = this,
        opts = this.opts.stylus || {},
        plugins = opts.plugins || {};
    
    try {
        var stylus = require('stylus'),
            renderer = stylus(input.content, { filename: input.file });

        // if we have plugins use them
        for (var key in plugins) {
            renderer.use(plugins[key]());
        }
        
        if (opts.urlEmbed) {
            renderer.define('url', stylus.url());
        }
        
        renderer.render(function(err, css) {
            if (err) {
                callback('could not render: ' + err.message);
            }
            else {
                callback(null, {
                    file: (input.file || '').replace(/\.styl$/, '.css'),
                    content: css
                });
            }
        });
    }
    catch (e) {
        callback(new Error('stylus not installed, run \'npm install stylus\' to add the plugin'));
    }
};