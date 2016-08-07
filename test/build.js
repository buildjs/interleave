var testcli = require('testcli')(__dirname);

describe('build tests', function() {
    it('should be able to perform a umd build with deps', testcli('build-umd-deps'));
    it('should be able to perform a umd build with no deps', testcli('build-umd-nodeps'));
    
    it('should automatically assume that "src/*.js" is requested when not specified', testcli('build-autoglob'));
    it('should assume the build command when none is supplied', testcli('build-defaultcommand'));
    it('should be able to use a custom moduleExport', testcli('build-customexport'));
    it('should be able to use a custom moduleName', testcli('build-customname'));

    /*
    it('should be able to resolve dependencies using resolveme', testcli('build-resolve'));
    it('should be able to resolve dependencies and create additional required files', testcli('build-resolve-extras'));
    */
});
