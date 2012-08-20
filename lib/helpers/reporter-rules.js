var path = require('path'),
    out = require('out');

exports['build:package'] = function(target, packageType) {
    out('     !{magenta}START: !{bold}{1} {0} package build', packageType || 'plain', path.basename(target));
};

exports['build:complete'] = function(target, packageType) {
    out('      !{magenta}DONE: !{underline}{0}!{}', target);
};

exports['build:error'] = function(target, packageType, err) {
    out('     !{red}ERROR: !{bold}{0}!{}\n            {1}\n', path.basename(target), err.message || err);
};

exports['include:file'] = function(requested, actual) {
    out(' !{blue}rig-found: !{}{0} ({1})', requested, actual);
};

exports['include:error'] = function(requested) {
    out('  !{red}rig-warn: !{}Could not resolve: ' + requested);
};