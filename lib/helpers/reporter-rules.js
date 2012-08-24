var path = require('path'),
    out = require('out');

exports['build:package'] = function(target, packageType) {
    out('       !{magenta}START: !{bold}{1} {0} package build', packageType || 'plain', path.basename(target));
};

exports['build:complete'] = function(target, packageType) {
    out('        !{magenta}DONE: !{underline}{0}!{}', target);
};

exports['build:error'] = function(target, packageType, err) {
    out('       !{red}ERROR: !{bold}{0}!{}\n            {1}\n', path.basename(target), err.message || err);
};

exports['include:file'] = function(requested, actual) {
    out('    !{blue}included: !{}{0}', requested, actual);
};

exports['include:dir'] = function(requested, actual) {
	out('   !{blue}rig-dir:   !{}{0} ({1})', requested, actual);
};

exports['include:error'] = function(requested) {
    out('   !{red}not-found: !{}Could not resolve: !{underline}' + requested);
};

exports['alias:invalid'] = function(alias) {
	out('   !{red}bad-alias: !{}No target specified for alias !{bold}' + alias);
};