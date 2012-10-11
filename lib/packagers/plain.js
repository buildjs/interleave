var _ = require('underscore');

module.exports = function(findresults, opts) {
    return _.extend({}, opts.settings, {
        content: findresults.content,
        resolvedContent: findresults.resolvedContent || '',
        
        dependencies: _.map(findresults.dependencies, function(dep) {
            return dep.toString();
        }),
        licence: ''
    });
};