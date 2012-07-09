
// req: underscore as _

(function(glob) {
    var simple = {};

    _.extend(simple, {
        test: true
    });
    
    if (typeof simple != 'undefined') {
        glob.simple = simple;
    }
}(this));