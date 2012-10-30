

// umdjs returnExports pattern: https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('underscore'), require('matchme'));
    } else if (typeof define === 'function' && define.amd) {
        define(['underscore', 'matchme'], factory);
    } else {
        root['simple'] = factory(root['underscore'], root['matchme']);
    }
}(this, function (_, matchme) {
    var simple = {};
    
    _.extend(simple, {
        test: true
    });
    
    return typeof simple != 'undefined' ? simple : undefined;
}));