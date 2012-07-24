var out = require('out');

exports['build:package'] = function(target, packageType) {
    out('     !{magenta}START: !{bold}{0} package build', packageType || 'plain', target);
};

exports['build:complete'] = function(target, packageType) {
    out('      !{magenta}DONE: !{underline}{0}!{}\n', target);
};

exports['include:file'] = function(requested, actual) {
    out(' !{blue}rig-found: !{}{0} ({1})', requested, actual);
};

exports['include:error'] = function(requested) {
    out('  !{red}rig-warn: !{}Could not resolve: ' + requested);
};