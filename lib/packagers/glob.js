var basePackager = require('./plain'),
    indent = require('../indent'),
    _ = require('underscore');

module.exports = function(findresults, opts) {
    return _.extend(basePackager(findresults, opts), {
        content: indent(findresults.content)        
    });
};