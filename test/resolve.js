var testcli = require('testcli')(__dirname);

describe('resolve tests', function() {
    it('should be able to resolve dependencies using resolveme', testcli('build-resolve'));
    it('should be able to resolve dependencies and create additional required files', testcli('build-resolve-extras'));

    it('should be able to integrate resolveme using jake', testcli('jake-resolve'));
});