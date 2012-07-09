
define('simple', ['underscore'], function(_) {
    var simple = {};

    _.extend(simple, {
        test: true
    });
    
    return typeof simple != 'undefined' ? simple : undefined;
});