module.exports = function(interleaver, flag) {
    return interleaver.flags[flag] ? Array.prototype.slice.call(arguments, 2).join(' ') : '';
};