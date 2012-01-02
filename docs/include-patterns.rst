.. _include patterns:

Include Patterns
================

An include pattern follows the same convention as `Sprockets`_ and is a single-line comment with an equal sign straight after the two slashes: ``//=`` followed by some whitespace, and then the file to include, e.g.::

	//= file/to/include.js

In sockets, apparently you can exclude the whitespace, but with interleave **the whitespace is required**.  So the following include **would not work**::

	//=file/to/include.js

Interleave also adopts a url like format for including files.  For instance, to include a file relative to the current file you would simply add a comment line like so:

.. code-block:: javascript

	var TEST = (function() {
	    //= lib/test.js
	})();

The trailing .js is optional, so ``//= lib/test`` is just as valid.

Github Includes
---------------

Now one thing I have longed for is the ability to bring in a file directly from github, so I've added support for that.  For instance, the following would bring in `underscore`_::

	//= github://documentcloud/underscore/underscore

Want a specific version of the library, well if the package maintainer is using `git tagging`_ then you can add a version specifier::

	//= github://documentcloud/underscore/underscore?v=1.1.2

**NOTE:** Version references can be used to access branch trees also...

Bitbucket Includes
------------------

Just like Github includes, but for `BitBucket`_::

	//= bitbucket://puffnfresh/roy/src/types

Googlecode Includes
-------------------

::

	//= gcode://glmatrix/hg/glMatrix

HTTP Includes
-------------

Behind the scenes, the github and bitbucket includes simply wrap a standard http includer, so you can also do this::

	//= http://code.jquery.com/jquery-1.6.2.js


Kudos to `Mikeal Rogers`_ for his `Request`_ package.  It makes this kind of thing so easy...

.. include:: links.txt