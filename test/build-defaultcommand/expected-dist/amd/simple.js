


define('simple', ['underscore', 'matchme'], function(_, matchme) {
    var simple = {};
    
    _.extend(simple, {
        test: true
    });
    
    return typeof simple != 'undefined' ? simple : undefined;
});