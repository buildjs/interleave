
define('test', [], function() {
    
    var test = {};
    
    _.extend(test, {
        test: true
    });
    
    return typeof test != 'undefined' ? test : undefined;
});