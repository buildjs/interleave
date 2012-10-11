module.exports = function(content, indent) {
    return content.split(/\n/).join('\n' + (indent || '    '));
};