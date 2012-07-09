var basePackager = require('./nowrap'),
    _ = require('underscore');

module.exports = function(findresults, opts) {
    var dependencies = _.map(findresults.dependencies, function(dep) {
        return dep.alias + ' = require(\'' + dep.name + '\')';
    });
    
    return _.extend(basePackager(findresults, opts), {
        dependencies: 'var ' + dependencies.join(',\n    ') + ';'
    });
};