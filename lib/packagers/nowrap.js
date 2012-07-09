var _ = require('underscore');

module.exports = function(findresults, opts) {
    return _.extend({}, opts.settings, {
        content: findresults.content,
        dependencies: _.map(findresults.dependencies, function(dep) {
            return dep.toString();
        }),
        licence: ''
    });
};