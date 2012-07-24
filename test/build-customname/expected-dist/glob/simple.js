
// req: 
(function(glob) {
    
    var test = {};
    
    _.extend(test, {
        test: true
    });
    
    if (typeof test != 'undefined') {
        glob.simple = test;
    }
}(this));