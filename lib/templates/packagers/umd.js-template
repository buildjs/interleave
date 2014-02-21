<%= resolvedContent %>

// umdjs returnExports pattern: https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(<%= dep.cjs %>);
    } else if (typeof define === 'function' && define.amd) {
        define([<%= dep.amd %>], factory);
    } else {
        root['<%= moduleExport %>'] = factory(<%= dep.root %>);
    }
}(this, function (<%= dep.exports %>) {
    <%= content %>
    
    return typeof <%= moduleExport %> != 'undefined' ? <%= moduleExport %> : undefined;
}));