Programmatic Use
================

One of the things I really liked about sprockets, is how if it's command-line interface wasn't a good fit then I could use a rubygem and get a little more control.  I've tried to replicate this functionality in Interleave.

For instance, here is the build.js file from a project called `Pager`_ that I'm working on::

	var interleave = require('interleave'),
	    fs = require('fs'),
	    path = require('path'),
	    config = {
	        aliases: {
	            'eve': 'github://DmitryBaranovskiy/eve/eve.js',
	            'interact': 'github://DamonOehlman/interact/interact.js',
	            'classtweak': 'github://DamonOehlman/classtweak/classtweak.js',
	            'when': 'github://briancavalier/when.js/when.js'
	        }
	    };
    
	interleave(['src/css', 'src/js'], {
	    config: config
	});    

	interleave(['src/css/plugins', 'src/js/plugins'], {
	    path: 'dist/plugins',
	    config: config
	});

.. include:: links.txt