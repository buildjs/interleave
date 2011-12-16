var debug = require('debug')('interleave'),
    request = require('request'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    out = require('out'),
    reLeadingSlash = /^\//,
    reStatusOK = /^(2|3)\d{2}$/,
    reVersion = /\d+\.\d+\.?\d*/,
    reVersionKey = /^(v|ver|version)$/i;
    
function getVersion(target) {
    // iterate through the query string parameters and look for a version string
    if (target.query) {
        for (var key in target.query) {
            if (reVersion.test(key)) {
                return key;
            }
            else if (reVersionKey.test(key)) {
                return target.query[key];
            } // if..else
        } // for
    } // if 
    
    return undefined;
} // getVersion

exports.file = function(interleaver, current, target, callback) {
    // if we have a current path specified, then translate the target
    // based on the current path
    var targetFile = path.resolve(current ? path.dirname(current) : interleaver.basedir, target.pathname);
    
    // read the specified file
    debug('attempting to read local file: ' + targetFile);
    fs.readFile(targetFile, 'utf8', function(err, content) {
        var sourceData;
        
        if (! err) {
            // initialise the source data
            sourceData = {
                file: targetFile,
                content: content
            };
        } // if
        
        // trigger the callback
        callback(err, sourceData);
    });
};

exports.http = function(interleaver, current, target, callback) {
    var targetUrl = url.format(target);
    debug('requesting url: ' + targetUrl);
    out('!{blue}request:!{}     ' + targetUrl);

    request({ uri: targetUrl }, function(err, response, body) {
        if (! err && (reStatusOK.test(response.statusCode))) {
            callback(null, {
                file: targetUrl,
                content: body
            });
        }
        else {
            callback(err || 'Invalid status');
        }
    });
}; // http loader

exports.gcode = exports.googlecode = function(interleaver, current, target, callback) {
    // formulate the real target and pass onto the http loader
    var realTarget = url.parse('https://' + target.host + '.googlecode.com' + target.pathname);
        
    // pass to the http loader
    exports.http(interleaver, current, realTarget, callback);
};

exports.github = function(interleaver, current, target, callback) {
    var version = getVersion(target) || 'master',
    
        // formulate the real target and pass onto the http loader
        pathParts = target.pathname.replace(reLeadingSlash, '').split('/'),
        realTarget = url.parse(
            'https://raw.github.com/' + target.host + '/' + 
            pathParts[0] + '/' + version + '/' + pathParts.slice(1).join('/')
        );
        
    // pass to the http loader
    exports.http(interleaver, current, realTarget, callback);
}; // github loader

exports.bitbucket = function(interleaver, current, target, callback) {
    var version = getVersion(target) || 'master',
    
        // formulate the real target and pass onto the http loader
        pathParts = target.pathname.replace(reLeadingSlash, '').split('/'),
        realTarget = url.parse(
            'https://bitbucket.org/' + target.host + '/' + 
            pathParts[0] + '/raw/' + version + '/' + pathParts.slice(1).join('/')
        );
        
    // pass to the http loader
    exports.http(interleaver, current, realTarget, callback);
};

exports.resources = function(interleave, current, target, callback) {
    console.log(target);
}; // resources