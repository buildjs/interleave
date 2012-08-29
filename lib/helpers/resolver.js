var debug = require('debug')('interleave'),
	squirrel = require('squirrel'),
	_ = require('underscore');

module.exports = function(findresults, targetExt, opts, callback) {
	// if the resolve option is not set, then pass the findresults straight through
	if (! opts.resolve) return callback(null, findresults);

	squirrel(['resolveme'], function(err, resolveme) {
		if (err) return callback(err);

		debug('resolving dependencies: ' + _.values(findresults.dependencies));
		resolveme(_.values(findresults.dependencies), opts, function(err, bundle) {
			var depsContent = [];

			if (err) return callback(err);

			// iterate through the bundle targets, and prepend the content
			depsContent = bundle.targets.map(function(target) {
				return target._manifest.getContent(targetExt);
			});

			// add the deps content to the start of the output
			findresults.content = depsContent.join('\n;') + '\n;' + findresults.content;

			// reset the dependencies to empty
			findresults.dependencies = {};

			// trigger the callback
			callback(null, findresults);
		});
	});
};