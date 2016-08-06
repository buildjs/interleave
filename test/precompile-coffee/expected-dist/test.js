

// umdjs returnExports pattern: https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root['test'] = factory();
    }
}(this, function () {
    (function() {
      var cubes, list, math, num, number, opposite, race, square,
        slice = [].slice;
    
      number = 42;
    
      opposite = true;
    
      if (opposite) {
        number = -42;
      }
    
      square = function(x) {
        return x * x;
      };
    
      list = [1, 2, 3, 4, 5];
    
      math = {
        root: Math.sqrt,
        square: square,
        cube: function(x) {
          return x * square(x);
        }
      };
    
      race = function() {
        var runners, winner;
        winner = arguments[0], runners = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return print(winner, runners);
      };
    
      if (typeof elvis !== "undefined" && elvis !== null) {
        alert("I knew it!");
      }
    
      cubes = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = list.length; i < len; i++) {
          num = list[i];
          results.push(math.cube(num));
        }
        return results;
      })();
    
    }).call(this);
    
    return typeof test != 'undefined' ? test : undefined;
}));