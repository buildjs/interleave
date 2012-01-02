Command Line Usage
==================

Interleave is designed as a command-line tool, but also supports [programmatic use](https://github.com/DamonOehlman/interleave/wiki/Programmatic-Use).  In the simplest case, where you have a single input file to be processed you would probably run::

	interleave src/main.js

This would parse the `main.js` file in the `src` folder and generate a `main.js` in a `dist` folder.  If the dist folder does not exist, then it will be automatically created.

Alternatively you can also call interleave and just specify that you want it to process the `src` directory.  In this case, each of the files (*not recursive*) in the `src` folder would be processed individually and pushed to the `dist` folder.

Command Line Switches
---------------------

Interleave supports a number of command-line switches which can be viewed by running `interleave --help`

``--watch``

You can also ask interleave to watch your sourcefile for changes and only compile files when it does detect a change.  This is done by supplying the `--watch` option::

	interleave src --watch