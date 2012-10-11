


define('simple', [], function() {
    
    var testExport = {};
    
    _.extend(testExport, {
        test: true
    });
    
    return typeof testExport != 'undefined' ? testExport : undefined;
});