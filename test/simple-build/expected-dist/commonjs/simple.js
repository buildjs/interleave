
var _ = require('underscore');

var simple = {};

_.extend(simple, {
    test: true
});

if (typeof simple != 'undefined') {
    module.exports = simple;
}