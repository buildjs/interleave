

// umdjs returnExports pattern: https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root['simple'] = factory();
    }
}(this, function () {
    var simple = {};
    
    _.extend(simple, {
        test: true
    });
    
    return typeof simple != 'undefined' ? simple : undefined;
}));