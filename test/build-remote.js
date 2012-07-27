var testcli = require('testcli')(__dirname);

describe('build tests (remote dependencies)', function() {
    it('should be able to perform a simple build that has a remote dependency', testcli('build-webdep'));
});