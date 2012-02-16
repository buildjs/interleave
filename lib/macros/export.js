module.exports = function(interleaver, targetFn) {
    if (! targetFn) {
        return '';
    }
    
    return '(typeof module != "undefined" && module.exports) ? ' + 
                '(module.exports = ' + targetFn + ') : ' + 
                '(typeof define != "undefined" ? ' + 
                    '(define("' + targetFn + '", [], function() { return ' + targetFn + '; })) : ' + 
                    '(glob.' + targetFn + ' = ' + targetFn + '));';
};