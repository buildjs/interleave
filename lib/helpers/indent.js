module.exports = function(content) {
    return content.split(/\n/).join('\n    ');
};