
// req: 
(function(glob) {
    var reSep = /[\/\.]/;
    
    function WildcardMatcher(text) {
        this.parts = (text || '').split(reSep);
    }
    
    WildcardMatcher.prototype.match = function(input) {
        var matches = true,
            parts = this.parts, 
            ii, partsCount = parts.length;
        
        if (typeof input == 'string' || input instanceof String) {
            var testParts = (input || '').split(reSep);
    
            for (ii = 0; matches && ii < partsCount; ii++) {
                matches = parts[ii] === '*' || parts[ii] === testParts[ii];
            }
        }
        else if (typeof input.splice == 'function') {
            matches = [];
            
            for (ii = input.length; ii--; ) {
                if (this.match(input[ii])) {
                    matches[matches.length] = input[ii];
                }
            }
        }
        else if (typeof input == 'object') {
            matches = {};
            
            for (var key in input) {
                if (this.match(key)) {
                    matches[key] = input[key];
                }
            }
        }
        
        return matches;
    };
    
    function wildcard(text, test) {
        var matcher = new WildcardMatcher(text);
        
        if (typeof test != 'undefined') {
            return matcher.match(test);
        }
    
        return matcher;
    }
    
    if (typeof wildcard != 'undefined') {
        glob.wildcard = wildcard;
    }
}(this));