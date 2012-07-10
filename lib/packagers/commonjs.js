var basePackager = require('./plain'),
    _ = require('underscore');

module.exports = function(findresults, opts) {
    var dependencies = _.map(findresults.dependencies, function(dep) {
        return dep.alias + ' = require(\'' + dep.name + '\')';
    });
    
    return _.extend(basePackager(findresults, opts), {
        dependencies: Object.keys(dependencies).length > 0 ? 'var ' + dependencies.join(',\n    ') + ';' : ''
    });
};