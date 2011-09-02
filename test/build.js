var interleave = require('../lib/interleave'),
    fs = require('fs'),
    path = require('path');
    
fs.readFile('build.json', function(err, data) {
    var config = JSON.parse(data);
    
    fs.readdir('testfiles', function(err, files) {
        var targetFiles = files.map(function(file) { return 'testfiles/' + file; });
        
        interleave(targetFiles, {
            multi: 'pass',
            path: path.resolve('out'),
            config: config
        });
    });
});