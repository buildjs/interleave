Getting Started
===============

Installation
------------

Install using `npm`_::

	npm install -g interleave

Including Files
---------------

Include statements in interleave are similar to those used in `Sprockets`_.
An include request for instance is a single-line comment with an equal sign **straight after** the two 
slashes: ``//=`` **followed by some whitespace**, and then the file to include::

	//= file/to/include.js

The extension is not required, so the following is also valid::

	//= file/to/include

Interleave also supports some url-esque include formats for including remote files, such as the following::

	//= github://documentcloud/underscore/underscore
	//= github://documentcloud/underscore/underscore?v=1.1.2
	//= bitbucket://puffnfresh/roy/src/types
	//= gcode://glmatrix/hg/glMatrix
	//= http://code.jquery.com/jquery-1.6.2.js

These formats are covered in more detail in the :ref:`Include Patterns` documentation.

.. include:: links.txt

