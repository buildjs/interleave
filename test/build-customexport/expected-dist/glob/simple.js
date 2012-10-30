// req: 

(function(glob) {
    
    var testExport = {};
    
    _.extend(testExport, {
        test: true
    });
    
    if (typeof testExport != 'undefined') {
        glob.simple = testExport;
    }
}(this));