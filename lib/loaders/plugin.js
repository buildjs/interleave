var debug = require('debug')('interleave-plugin'),
    path = require('path');

module.exports = function(interleave, current, target, rawTarget, callback) {
    var pluginModule = target.hostname,
        args = rawTarget.split(/\s/).splice(1);

    try {
        var plugin = require(target.hostname);
        
        if (typeof plugin.async == 'function') {
            plugin.async.apply(plugin, args.concat(callback));
        }
        else {
            // run the plugin
            callback(null, plugin.apply(plugin, args));
        }
    }
    catch (e) {
        debug('Plugin inclusion failed: ', e);
        callback('Unable to load plugin: ' + target.hostname);
    }
}; // resources