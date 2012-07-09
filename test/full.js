var testcli = require('testcli')(__dirname);

describe('build tests', function() {
    it('should be able to perform a simple build', testcli('simple-build'));
    it('should be able to perform a simple build that has a remote dependency', testcli('simple-webdep'));
});