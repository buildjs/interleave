module.exports = function(interleaver, targetFn) {
    if (! targetFn) {
        return '';
    }
    
    return '(typeof module != "undefined" && module.exports) ? ' + 
                '(module.exports = ' + targetFn + ') : ' + 
                    '(glob.' + targetFn + ' = ' + targetFn + ');';
};