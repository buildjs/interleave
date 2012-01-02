Pre-processors
==============

Interleave supports an extensible set of preprocessors. A preprocessor is simply a file that can take the contents of a file and turn it into one of the core formats supported by interleave (`.js` or `.css`).

Currently supported preprocessors are described below.  It should also be noted that it is simple to add more (just check out the source of one of the existing preprocessors).

CoffeeScript
------------

``.coffee``

The CoffeeScript preprocessor allows you to mix and match your own 'hand-crafted' JS with CoffeeScript's generated JS.

.. code-block:: javascript

	function MyCounter() {
	    this.count = 0;
	}
	
	MyClass.prototype.increment = function() {
	    this.count += 1;
	};
	
	//= github://jashkenas/coffee-script/examples/code.coffee

Additionally, any `.coffee` files in your specified input files will be converted into appropriate `.js` versions.

Roy
---

``.roy``

Stylus
------

``.styl``

You can either have `.styl` files in your sources directory and these will be converted into `.css` files in the output, or you can have plain old `.css` files in your sources with `.styl` includes:

.. code-block:: css

	body {
		background: lime; /* everyone loves lime */
	}
	
	/*= github://LearnBoost/stylus/examples/basic.styl */