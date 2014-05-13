var async = require('async');
var events = require('events');
var builder = new events.EventEmitter();
var debug = require('debug')('interleave');
var findme = require('findme');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var reporter = require('reporter');
var rigger = require('rigger');
var _ = require('underscore');
var addmeta = require('./addmeta');
var resolver = require('./resolver');
var reIsInSource = /^src\//i;

// have the reporter watch the builder
reporter.watch(builder);

exports.createRigger = function(source, targetExt, opts) {
  var sourceExt = path.extname(source);
  var moduleName = path.basename(source, sourceExt);
  var relTarget = source.replace(opts.sourcePath, '');

  // ensure we have opts
  opts = opts || {};

  debug('creating rigger instance for source: ' + source);

  function getTargetFile(packageType, opts) {
    var targetTemplate = opts.targetTemplate;

    // initialise the target template
    if (! targetTemplate) {
      // initialise to the default template
      targetTemplate = '<%= filename %><%= ext %>';

      // if we are wrapping and have more than one package type add the package type
      if (Array.isArray(opts.wrap) && opts.wrap.length > 1) {
        targetTemplate = '<%= packageType %><%= sep %>' + targetTemplate;
      }
    }

    return path.resolve(opts.output, opts.targetFilename || _.template(targetTemplate, {
      packageType: packageType,
      filename: path.basename(source, path.extname(source)),
      ext: targetExt,
      sep: path.sep || opts.sep || '/'
    }));
  }

  /**
    ### rig

    The rig function wraps the rigging logic (including binding the reporter) into a single
    function call.
    */
  function rig(riggerOpts, callback) {
    var riggerInstance;

    // start rigging
    riggerInstance = rigger(source, riggerOpts, function(err, output, settings) {
      // release rig from the reporter
      reporter.release(riggerInstance);

      // if we hit an error rigger, then return
      if (err) {
        builder.emit('build:error', err);
      }
      // otherwise, if we have settings, then update the original settings
      else if (settings) {
        // update the in the original rigger opts settings
        _.extend(riggerOpts.settings, settings, {
          // if the module name has been updated, but the module export still matches the original
          // name then update this to match the updated name
          moduleExport: settings.moduleName !== moduleName && settings.moduleExport === moduleName ?
          settings.moduleName :
          settings.moduleExport
        });
      }

      // fire the callback
      callback.apply(this, arguments);
    });

    // let the reporter filter events
    reporter.watch(riggerInstance);
  }

  /**
    ### rigAndWrite

    The rigAndWrite function is used to shortcut the advanced functionality of interleave
    and defer to a very simple rigger implementation.  While interleave is designed primarily
    as a JS build tool the underlying functionality of rigger is very useful for CSS files
    and others.  The rigAndWrite call is invoked when the target file is not a JS file
    */
  function rigAndWrite(riggerOpts, targetFile, callback) {
    rig(riggerOpts, function(err, output, settings) {
      if (err) return callback(err);

      mkdirp(path.dirname(targetFile), function(err) {
        fs.writeFile(targetFile, output, 'utf8', callback);
      });
    });
  }

  return function(packageType, callback) {
    // ensure the packageType is properly defined
    // if opts.plain specified, use the plain template
    // if opts.resolve specified, use the glob template (really doesn't make sense in umd / amd / commonjs
    // otherwise, fall back to the umd template
    packageType = packageType || (opts.plain ? 'plain' : (opts.resolve ? 'glob' : 'umd'));

    // initialise variables
    var output;
    var initialFindResults;
    var wrapper;
    var wrapperPath = path.resolve(__dirname, 'templates', 'packagers', packageType) + targetExt + '-template';
    var packager;
    var riggerOpts = _.extend({}, opts, {
      targetType: targetExt,
      tolerant: true,
      cwd: reIsInSource.test(source) ? path.resolve(opts.sourcePath, '..') : opts.sourcePath,
      settings: {
        filename: path.basename(source),
        moduleName: moduleName,
        moduleExport: moduleName,
        packageType: packageType,
        platform: packageType
      }
    });

    // initialise the target file name to a non-packaged filename
    var targetFile = getTargetFile('', opts);

    // if the target extension is not js, then just rig and write
    if (targetExt !== '.js') return rigAndWrite(riggerOpts, targetFile, callback);

    // read the wrapper
    debug('reading package template: ' + wrapperPath);
    fs.readFile(wrapperPath, 'utf8', function(err, wrapperText) {
      if (err) return callback(new Error('No ' + packageType + ' template @ ' + wrapperPath));

      // ensure we have wrapper text (in the case of non-packaged files we need a default)
      wrapperText = wrapperText || '<%= content %>';

      // emit the build package message
      builder.emit('build:package', source, packageType);

      // rig the file
      debug('rigging source file: ' + source);
      rig(riggerOpts, function(err, output, settings) {
        if (err) return callback(err);

        // get the initial find results
        initialFindResults = findme(output);

        // initialise the packager
        packager = require('./packagers/' + packageType);

        // initialise the target file
        targetFile = getTargetFile(packageType, opts);

        // run the resolver to resolve external dependencies (if --resolve specified)
        resolver(builder, initialFindResults, targetFile, opts, function(err, findresults) {
          // if we received an error, then abort
          if (err) return callback(err);

          // generate the output using the formatter
          output = _.template(wrapperText, packager(findresults, riggerOpts));

          // make the output file, then write the output
          mkdirp(path.dirname(targetFile), function(err) {
            if (err) return callback(new Error('Unable to create directory for outputfile: ' + targetFile));

            // add the metadata
            addmeta(output, riggerOpts, findresults.dependencies, function(err, fullOutput) {
              if (err) return callback(err);

              // create the output file
              fs.writeFile(targetFile, fullOutput, 'utf8', callback);

              // emit the build complete event
              builder.emit('build:complete', targetFile, packageType);
            });
          });
        });
      });
    });
  };
};
