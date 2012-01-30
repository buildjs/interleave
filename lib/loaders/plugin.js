var debug = require('debug')('interleave-plugin'),
    path = require('path');

module.exports = function(interleaver, current, target, rawTarget, callback) {
    var plugin,
        pluginModule = target.hostname,
        args = [interleaver, current].concat(rawTarget.split(/\s/).splice(1));
        
    try {
        try {
            // try including the plugin (as interleave-plugin)
            plugin = require('interleave-' + target.hostname);
        }
        catch (e) {
            // ok, that failed, just try requiring it as is
            plugin = require(target.hostname);
        }

        if (typeof plugin == 'function') {
            plugin.apply(plugin, args.concat(callback));
        }
        else if (typeof plugin.sync == 'function') {
            // run the plugin
            callback(null, plugin.sync.apply(plugin, args));
        }
        else {
            throw new Error('No valid plugin entry point');
        }
    }
    catch (e) {
        debug('Plugin inclusion failed: ', e);
        callback('Unable to load plugin: ' + target.hostname);
    }
}; // resources