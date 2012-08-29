
// req: wildcard,matchme
(function(glob) {
    var definitions = {};
        
    var _listeners = {},
        reEventType = /^(\w+)\:(.*)$/;
        
    function _parseEventPattern(pattern) {
        // extract the event type from the pattern
        var match = reEventType.exec(pattern),
            details = {
                type: 'default',
                pattern: pattern
            };
        
        // if we have a match, then appropriately map the pattern 
        if (match) {
            details.type = match[1];
            details.pattern = match[2];
        }
        
        return details;
    }
    
    function _bind(pattern, handler) {
        var evt = _parseEventPattern(pattern);
        
        // create the array if required
        if (! _listeners[evt.type]) {
            _listeners[evt.type] = [];
        }
        
        _listeners[evt.type].push({ matcher: wildcard(evt.pattern), handler: handler });
    }
    
    function _trigger(eventType, def) {
        var listeners = _listeners[eventType] || [];
        
        for (var ii = 0, count = listeners.length; ii < count; ii++) {
            if (listeners[ii].matcher.match(def.namespace)) {
                listeners[ii].handler.call(this, def);
            }
        }
    }
    
    function _unbind(pattern, handler) {
        var evt = _parseEventPattern(pattern),
            listeners = _listeners[evt.type] || [];
            
        // iterate through the listeners and splice out the matching handler
        for (var ii = listeners.length; ii--; ) {
            var matcher = listeners[ii].matcher;
            
            if (matcher && matcher.match(evt.pattern) && listeners[ii].handler === handler) {
                listeners.splice(ii, 1);
            }
        } 
    }
    function RegistryDefinition(namespace, constructor, attributes) {
        var key;
        
        // initialise members
        this.namespace = namespace;
        
        // initialise the attributes
        this.attributes = attributes || {};
        
        // initialise the prototype
        this._prototype = {};
        
        // deal with the various different constructor values appropriately
        if (typeof constructor == 'function') {
            var emptyPrototype = true;
            
            // update the constructor
            this.constructor = constructor;
    
            // check for prototype keys
            for (key in constructor.prototype) {
                emptyPrototype = false;
                break;
            }
            
            // add the prototype associated with the constructor to the current prototype
            if (! emptyPrototype) {
                this._prototype = constructor.prototype;
            }
        }
        else {
            this.instance = constructor;
        }
        
        // mark this as not being a singleton instance (until told otherwise)
        this._singleton = false;
    }
    
    RegistryDefinition.prototype = {
        create: function() {
            var newObject = this.instance, key;
            
            // if the object has not already been created, then create the new instance
            if ((! newObject) && this.constructor) {
                // create the new object or re-use the instance if it's there
                newObject = this.instance || this.constructor.apply(null, arguments);
                
                // update the attribute values on the new instance
                for (key in this.attributes) {
                    if (typeof newObject[key] == 'undefined') {
                        newObject[key] = this.attributes[key];
                    }
                }
                
                // if the new object has successfully been created, and is of type object
                // then assign the prototype
                if (typeof newObject == 'object') {
                    var proto = Object.getPrototypeOf(newObject);
                    
                    // copy any methods from the object prototype into this prototype
                    for (key in this._prototype) {
                        if (typeof proto[key] == 'undefined') {
                            proto[key] = this._prototype[key];
                        }
                    }
                }
                
                // if we have the new object, then trigger the create event
                if (typeof newObject != 'undefined') {
                    // trigger the create
                    _trigger.call(newObject, 'create', this);
    
                    // if the definition is a singleton and the instance is not yet assigned, then do that now
                    if (this._singleton && (! this.instance)) {
                        this.instance = newObject;
                    }
                }
            } 
    
            return newObject;
        },
        
        extend: function(proto) {
            for (var key in proto) {
                // if none of the descendant prototypes have implemented this member, then copy
                // it across to the new prototype
                if (typeof this._prototype[key] == 'undefined') {
                    this._prototype[key] = proto[key];
                }
            }
            
            return this;
        },
        
        matches: function(test) {
            return matchme(this.attributes, test) || matchme(this._prototype, test);
        },
        
        singleton: function() {
            this._singleton = true;
            return this;
        }
    };
    function RegistryResults() {
        this.items = [];
    }
    
    RegistryResults.prototype.create = function() {
        return this.items[0] ? this.items[0].create.apply(this.items[0], arguments) : undefined;
    };
    
    RegistryResults.prototype.current = function() {
        return this.instances()[0];
    };
    
    RegistryResults.prototype.instances = function() {
        var results = [];
    
        for (var ii = 0, count = this.items.length; ii < count; ii++) {
            if (this.items[ii].instance) {
                results[results.length] = this.items[ii].instance;
            }
        }
        
        return results;
    };
    
    RegistryResults.prototype.filter = function(callback) {
        var results = new RegistryResults();
        
        for (var ii = 0, count = this.items.length; ii < count; ii++) {
            if (callback(this.items[ii])) {
                results.items.push(this.items[ii]);
            }
        }
        
        return results;
    };
    
    // john resig's getPrototypeOf shim: http://ejohn.org/blog/objectgetprototypeof/
    if ( typeof Object.getPrototypeOf !== "function" ) {
      if ( typeof "test".__proto__ === "object" ) {
        Object.getPrototypeOf = function(object){
          return object.__proto__;
        };
      } else {
        Object.getPrototypeOf = function(object){
          // May break if the constructor has been tampered with
          return object.constructor.prototype;
        };
      }
    }
    
    function registry(namespace, test) {
        var matcher = wildcard(namespace),
            results = new RegistryResults();
        
        for (var key in definitions) {
            if (matcher.match(key)) {
                results.items.push(definitions[key]);
            }
        }
        
        // if we have been passed a matchme test string, then filter the results
        if (typeof test != 'undefined') {
            results = results.filter(function(item) {
                return item.matches(test);
            });
        }
        
        return results;
    }
    
    function _define(namespace, constructor, attributes) {
        if (definitions[namespace]) {
            throw new Error('Unable to define "' + namespace + '", it already exists');
        }
        
        // create the definition and return the instance
        var definition = definitions[namespace] = new RegistryDefinition(namespace, constructor, attributes);
        
        // trigger the define event (use setTimeout to allow other assignments to complete)
        setTimeout(function() {
            // trigger the event
            _trigger.call(definition, 'define', definition);
        }, 0);
        
        // return the definition
        return definition;
    }
    
    function _fn(namespace, handler) {
        // create the definition
        var definition = _define(namespace);
        
        // set the instance of the definition to the handler
        definition.instance = handler;
        
        // return the definition
        return definition;
    }
    
    function _module() {
        var definition = _define.apply(null, arguments);
        
        // set the definition as a singleton
        definition.singleton();
        
        // return the new definition
        return definition;
    }
    
    // ## registry.scaffold
    // The scaffold function is used to define a prototype rather than a module pattern style 
    // constructor function.  Internally the registry creates a define call and creates an 
    // anonymous function that creates a new instance of the prototype via the constructor 
    // and ensures that the prototype has be assigned to the object
    function _scaffold(namespace, constructor, prototype) {
        // if the constructor is not a function, then remap the arguments
        if (typeof constructor != 'function') {
            prototype = constructor;
            constructor = null;
        }
        
        var def = _define(namespace, function() {
            var instance = constructor ? new constructor() : {};
            
            // if we have been supplied arguments, then call the constructor again
            // with the arguments supplied
            if (instance && arguments.length > 0) {
                constructor.apply(instance, arguments);
            }
            
            // return the new instance
            return instance;
        });
        
        return prototype ? def.extend(prototype) : def;
    }
    
    function _undef(namespace) {
        delete _defitions[namespace];
    }
    
    registry.define = _define;
    registry.find = registry;
    registry.fn = _fn;
    registry.scaffold = _scaffold;
    registry.module = _module;
    registry.undef = _undef;
    
    // event handling
    registry.bind = _bind;
    registry.unbind = _unbind;
    
    if (typeof registry != 'undefined') {
        glob.registry = registry;
    }
}(this));