var testcli = require('testcli')(__dirname);
    
describe('altJS tests', function() {
    it('should be able to convert coffee-script to js', testcli('altjs-coffee'));    
});