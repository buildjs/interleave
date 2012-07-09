
var _ = require('underscore'),
    matchme = require('matchme');

var simple = {};

_.extend(simple, {
    test: true
});

if (typeof simple != 'undefined') {
    module.exports = simple;
}