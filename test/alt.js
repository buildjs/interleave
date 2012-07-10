var testcli = require('testcli')(__dirname);

describe('transpiling tests', function() {
    it('should be able to generate coffee-script dist without traspilation', testcli('simple-coffee'));
});