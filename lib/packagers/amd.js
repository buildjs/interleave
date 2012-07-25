var basePackager = require('./plain'),
    indent = require('../helpers/indent'),
    _ = require('underscore');

module.exports = function(findresults, opts) {
    var depnames = _.pluck(findresults.dependencies, 'path'),
        depaliases = _.pluck(findresults.dependencies, 'alias');
    
    return _.extend(basePackager(findresults, opts), {
        content: indent(findresults.content),
        dependencies: {
            exports: depaliases.join(', '),
            names: depnames.map(function(name) {
                return '\'' + name + '\'';
            }).join(', ')
        }
    });
};