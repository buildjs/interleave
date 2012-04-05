var async = require('async'),
    fs = require('fs'),
    path = require('path'),
    out = require('out'),
    jshint = require('jshint'),
    formatter = require('formatter'),
    reLeadingSpaces = /^\s*/,
    line = formatter('{{ space }}!{0x2326,red}  {{ line }}:{{ character }} - {{ text }}\n{{ space }}!{grey}{{ evidence }}\n{{ space }}{{ indicator }}');

// register the files that can be postprocessed 
exports.extensions = ['.js'];

// define the post processor
exports.process = function(interleaver, files, callback) {
    // run the post processors
    async.forEach(files, function(item, itemCallback) {
        // read the file
        fs.readFile(item, 'utf8', function(err, data) {
            if (err) {
                itemCallback(err);
            }
            else {
                out('!{grey}linting:  !{}   '  + item);
                
                if (! jshint.JSHINT(data)) {
                    jshint.JSHINT.errors.forEach(function(error) {
                        var evidence = (error.evidence || '').replace(reLeadingSpaces, ''),
                            text = error.raw || '',
                            indicator = '',
                            indicatorPos = error.character - (error.evidence.length - evidence.length);
                        
                        ['a', 'b', 'c', 'd'].forEach(function(varname) {
                            if (error[varname]) {
                                text = text.replace(new RegExp('\\{' + varname + '\\}', 'g'), error[varname]);
                            }
                        });
                        
                        // add an indicator character
                        while (indicator.length < indicatorPos) {
                            indicator += ' ';
                        }
                        
                        // update the error details
                        error.space = '             ';
                        error.evidence = evidence;
                        error.text = text;
                        error.indicator = indicator + '!{0x2303,red}';

                        out(line(error));
                    });
                }
                /*
                try {
                    // mangle squeeze and generate the compressed code
                    fs.writeFile(
                        path.join(path.dirname(item), path.basename(item, '.js') + '.min.js'), 
                        uglify(data), 
                        'utf8',
                        itemCallback
                    );
                }
                catch (e) {
                    itemCallback('error uglifying source: ' + e);
                }
                */
                
                itemCallback();
            }
        });
    }, callback);
};
