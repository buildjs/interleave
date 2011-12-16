var fs = require('fs'),
    preprocessors = ['stylus', 'coffee-script'],
    libs = {};

// try loading the requested extensions
preprocessors.forEach(function(mod) {
    try {
        libs[mod] = require(mod);
    }
    catch (e) {
        
    } // try..catch
});

function reportNoExtension(extension, packageName) {
    return function(targetFile, callback) {
        callback('could not load ' + extension + ', install via npm: npm install ' + (packageName || extension));
    };
} // reportNoExtension

// Stylus: http://learnboost.github.com/stylus/
 
exports['.styl'] = libs.stylus ? function(input, callback) {
    var interleave = this;
    
    // render the stylus css
    libs.stylus.render(input.content, { filename: input.file }, function(renderErr, css) {
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
} : reportNoExtension('stylus');

// CoffeeScript: http://coffeescript.org/

exports['.coffee'] = libs['coffee-script'] ? function(input, callback) {
    try {
        callback(null, {
            file: (input.file || '').replace(/\.coffee$/, '.js'),
            content: libs['coffee-script'].compile(input.content)
        });
    }
    catch (e) {
        callback('compile error: ' + e.message);
    } // try..catch
} : reportNoExtension('coffee-script');

