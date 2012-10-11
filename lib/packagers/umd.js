var basePackager = require('./plain'),
    indent = require('../indent'),
    _ = require('underscore');

module.exports = function(findresults, opts) {
    var depnames = _.pluck(findresults.dependencies, 'path'),
        depaliases = _.pluck(findresults.dependencies, 'alias');

    return _.extend(basePackager(findresults, opts), {
        content: indent(findresults.content),
        dep: {
            exports: depaliases.join(', '),
            
            amd: depnames.map(function(name) {
                return '\'' + name + '\'';
            }).join(', '),
            
            cjs: depnames.map(function(name) {
                return 'require(\'' + name + '\')';
            }).join(', '),
            
            root: depnames.map(function(name) {
                return 'root[\'' + name + '\']';
            }).join(', ')
        }
    });
};