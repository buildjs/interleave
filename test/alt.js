var testcli = require('testcli')(__dirname);

describe('altJS tests', function() {
    it('should be able to generate coffee-script dist without traspilation', testcli('simple-coffee'));
});