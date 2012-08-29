
// req: 
(function(glob) {
    var reExpr = /([\w\.]+)\s*([\><\!\=]\=?)\s*([\-\w\.]+)/,
        reQuotedExpr = /([\w\.]+)\s*([\><\!\=]\=?)\s*\"([^\"]+)\"/,
        reRegexExpr = /([\w\.]+)\s*([\=\!]\~)\s*(\/[^\s]+\/\w*)/,
        reRegex = /^\/(.*)\/(\w*)$/,
        reBool = /^(true|false)$/i,
        reFalsyWords = /(undefined|null|false)/g,
        reTruthyWords = /(true)/g,
        reWords = /([\w\.]{2,})/,
        reSillyFn = /0\(.*?\)/g,
        exprLookups = {
            '==': ['equals'],
            '>':  ['gt'],
            '>=': ['gte'],
            '<':  ['lt'],
            '<=': ['lte'],
            '!=': ['equals', 'not'],
            '=~': ['regex'],
            '!~': ['regex', 'not']
        },
        wordReplacements = {
            and: '&&',
            or: '||'
        };
    
    /**
     * class Matcher
     *
     **/
     
    /**
     * new Matcher(target, [opts])
     * - target (Object): the object that match operations will be checked against
     *
     **/
    function Matcher(target, opts) {
        // initialise options
        this.opts = opts || {};
    
        // initialise members
        this.target = target;
        this.ok = true;
    }
    
    Matcher.prototype = {
        /** chainable
        * Matcher#gt(prop, value, [result])
        *
        * Check whether the specified property of the target object is greater than 
        * the specified value.  If the optional result argument is passed to the function
        * then the result is passed back in that object. If not the result is stored in
        * the local `ok` property of the matcher instance.  Other comparison methods use
        * the same principle as this function.
        **/
        gt: function(prop, value, result) {
            result = result || this;
            result.ok = result.ok && this.target && this._val(prop) > value;
            
            return this;
        },
        
        /** chainable
        * Matcher#gte(prop, value, [result])
        *
        * Greater than or equal to check.
        **/
        gte: function(prop, value, result) {
            result = result || this;
            result.ok = result.ok && this.target && this._val(prop) >= value;
            
            return this;
        },
        
        /** chainable
        * Matcher#lt(prop, value, [result])
        *
        * Less than property value check
        **/
        lt: function(prop, value, result) {
            result = result || this;
            result.ok = result.ok && this.target && this._val(prop) < value;
            
            return this;
        },
        
        // Test for a property being equal or less than the specified value
        lte: function(prop, value, result) {
            result = result || this;
            result.ok = result.ok && this.target && this._val(prop) <= value;
            
            return this;
        },
        
        // Test for equality of the specified property
        equals: function(prop, value, result) { 
            result = result || this;
            
            if (result.ok && this.target) {
                var testVal = this._val(prop),
                    strings = (typeof testVal == 'string' || testVal instanceof String) &&
                        (typeof value == 'string' || value instanceof String);
    
                // if the test value is a string and the value is a string
                if (strings && (! this.opts.caseSensitive)) {
                    result.ok = testVal.toLowerCase() === value.toLowerCase();
                }
                else {
                    result.ok = testVal === value;
                }
            }
            
            return this;
        },
        
        not: function(prop, value, result) {
            // invert the passes state
            result = result || this;
            result.ok = !result.ok;
            
            return this;
        },
        
        regex: function(prop, value, result) {
            result = result || this;
            
            // if the result is still ok, then check the regex
            if (result.ok && this.target) {
                var regex = value;
                
                // if the regex is currently a string, then parse into a regular expression
                if (typeof regex == 'string' || regex instanceof String) {
                    var match = reRegex.exec(value);
                    if (match) {
                        regex = new RegExp(match[1], match[2]);
                    }
                }
                
                // if we now have a regex, then update the result ok
                if (regex instanceof RegExp) {
                    result.ok = regex.test(this._val(prop));
                }
            }
            
            return this;
        },
        
        query: function(text) {
            var match;
            
            // evaluate expressions
            text = this._evaluateExpressions(text, reQuotedExpr);
            text = this._evaluateExpressions(text, reRegexExpr);
            text = this._evaluateExpressions(text, reExpr);
            
            // replace falsy words with 0s and truthy words with 1s
            text = text.replace(reFalsyWords, '0').replace(reTruthyWords, '1');
            
            // find any remaining standalone words
            match = reWords.exec(text);
            while (match) {
                var replacement = wordReplacements[match[0].toLowerCase()];
                
                // if we don't have a replacement for a word then look for the value of the property on the target
                if ((! replacement) && this.target) {
                    replacement = this._val(match[0]) ? true : false;
                }
                
                text = text.slice(0, match.index) + replacement + text.slice(match.index + match[0].length);
                
                // replace falsy words with 0s and truthy words with 1s
                text = text.replace(reFalsyWords, '0').replace(reTruthyWords, '1');
                
                // run the test again
                match = reWords.exec(text);
            }
            
            // replace peoples attempts at including functions with 0
            text = text.replace(reSillyFn, '0');
            
            // evaluate the expression
            try {
                this.ok = eval(text) == true;
            }
            catch (e) {
                this.ok = false;
                this._errtext = text;
            }
            
            return this;
        },
        
        /** internal
        * Matcher#_evaluateExpressions(text, expr)
        *
        **/
        _evaluateExpressions: function(text, expr) {
            var match = expr.exec(text);
                
            while (match) {
                var fns = exprLookups[match[2]] || [],
                    result = {
                        ok: fns.length > 0
                    },
                    val1 = parseFloat(match[1]) || match[1],
                    val2 = parseFloat(match[3]) || match[3];
                    
                // if value 2 is a boolean, then parse it
                if (reBool.test(val2)) {
                    val2 = val2 == 'true';
                }
                
                // iterate through the required functions in order and evaluate the result
                for (var ii = 0, count = fns.length; ii < count; ii++) {
                    var evaluator = this[fns[ii]];
                    
                    // if we have the evaluator, then run it
                    if (evaluator) {
                        evaluator.call(this, val1, val2, result);
                    }
                }
                
                text = text.slice(0, match.index) + result.ok + text.slice(match.index + match[0].length);
                match = expr.exec(text);
            }
            
            return text;
        },
        
        _val: function(prop) {
            var value = this.target[prop];
    
            // if the value is undefined, we'll attempt looking for nested properties
            if (typeof value == 'undefined') {
                var props = prop.split('.');
                if (props.length > 1) {
                    value = this.target;
                    while (value && props.length) {
                        value = value[props.shift()];
                    }
                }
            }
            
            return value;
        }
    };
    
    /*
    Create a matcher that will execute against the specified target.
    */
    function matchme(target, opts, query) {
        var matcher;
        
        // check for no options being supplied (which is the default)
        if (typeof opts == 'string' || opts instanceof String) {
            query = opts;
            opts = {};
        }
        
        // create the matcher
        matcher = new Matcher(target, opts);
        
        if (typeof query != 'undefined') {
            return matcher.query(query).ok;
        }
        else {
            return matcher;
        }
    }
    
    matchme.filter = function(array, query, opts) {
        var matcher;
        
        // if the array has been ommitted (perhaps underscore is being used)
        // then push up arguments and undef the array
        if (typeof array == 'string' || array instanceof String) {
            opts = query;
            query = array;
            array = null;
        }
        
        // create the matcher on a null target
        matcher = new Matcher(null, opts);
        
        if (array) {
            var results = [];
            for (var ii = 0, count = array.length; ii < count; ii++) {
                matcher.target = array[ii];
                if (matcher.query(query).ok) {
                    results[results.length] = array[ii];
                }
            }
            
            return results;
        }
        else {
            return function(target) {
                // update the matcher target
                matcher.target = target;
                
                return matcher.query(query).ok;
            };
        }
    };
    
    if (typeof matchme != 'undefined') {
        glob.matchme = matchme;
    }
}(this));