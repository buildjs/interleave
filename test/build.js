var testcli = require('testcli')(__dirname);

describe('build tests', function() {
    it('should be able to perform a simple build', testcli('build-simple'));
    it('should automatically assume that "src/*.js" is requested when not specified', testcli('build-autoglob'));
    it('should assume the build command when none is supplied', testcli('build-defaultcommand'));
    
    it('should be able to use a custom moduleExport', testcli('build-customexport'));
    it('should be able to use a custom moduleName', testcli('build-customname'));

    it('should be able to resolve dependencies using resolveme', testcli('build-resolve'));
});