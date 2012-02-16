module.exports = function(interleaver) {
    var headerLine = (interleaver.data.name || '') + ' ' + (interleaver.data.version || ''),
        header = 
            '// ' + headerLine + '\n' +
            '// ────────────────────────────────────────────────────────────────────────────────────────\n' + 
            '// ' + (interleaver.data.description || '') + '\n' +
            '// ────────────────────────────────────────────────────────────────────────────────────────\n'; 
    
    return header;
};