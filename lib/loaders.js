var request = require('request'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
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
    var targetFile = path.resolve(current ? path.dirname(current) : null, target.pathname);
    
    // read the specified file
    fs.readFile(targetFile, 'utf8', function(err, content) {
        if (! err) {
            // initialise the source data
            var sourceData = {
                file: targetFile,
                content: content
            };

            // add to the tracked sources
            interleaver.sources.push(sourceData);
        } // if
        
        // trigger the callback
        callback(err, sourceData);
    });
};

exports.http = function(interleaver, current, target, callback) {
    var targetUrl = url.format(target);
    console.log('using the http loader to load: ', targetUrl);

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

exports.github = function(interleaver, current, target, callback) {
    var version = getVersion(target) || 'master';
    
    console.log('using the github loader to load: ', url.format(target));
    
    // formulate the real target and pass onto the http loader
    var pathParts = target.pathname.replace(reLeadingSlash, '').split('/'),
        realTarget = url.parse(
            'https://raw.github.com/' + target.host + '/' + 
            pathParts[0] + '/' + version + '/' + pathParts.slice(1).join('/')
        );
        
    // pass to the http loader
    exports.http(interleaver, current, realTarget, callback);
}; // github loader

exports.bitbucket = function(interleaver, current, target, callback) {
    var version = getVersion(target) || 'tip';
    
    console.log('using bitbucket loader to load: ' + url.format(target));
    
    // formulate the real target and pass onto the http loader
    var pathParts = target.pathname.replace(reLeadingSlash, '').split('/'),
        realTarget = url.parse(
            'https://bitbucket.org/' + target.host + '/' + 
            pathParts[0] + '/raw/' + version + '/' + pathParts.slice(1).join('/')
        );
        
    // pass to the http loader
    exports.http(interleaver, current, realTarget, callback);
};