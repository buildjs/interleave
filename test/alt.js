var testcli = require('testcli')(__dirname);
    
describe('altJS tests', function() {
    it('should be able to generate coffee-script dist without traspilation', testcli('altjs-coffee'));    
    it('should be able to transpile coffee-script to javascript', testcli('altjs-coffee2js'));
});