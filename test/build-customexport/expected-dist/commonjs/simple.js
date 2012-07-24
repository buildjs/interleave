



var testExport = {};

_.extend(testExport, {
    test: true
});

if (typeof testExport != 'undefined') {
    module.exports = testExport;
}
