var testcli = require('testcli')(__dirname);
    
describe('precompiler tests', function() {
    it('should be able to convert coffee-script to js', testcli('precompile-coffee'));
    it('should be able to convert stylus to css', testcli('precompile-stylus'));
});