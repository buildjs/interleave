Aliases
=======

Another feature you can use when working with Interleave are __aliases__.  Aliases are a very powerful feature that will allow you to change the location that a particular include is sourced from.  

If you are going to use aliases, you will need to make use of [[Build Configurations]].  A build 
configuration can either be specified when doing a programmatic build or by having supplying a JSON configuration file.  
By default, Interleave looks for `build.json` in the current working directory.  If found, it will load the 
configuration information into the executing context.

Consider the following configuration file:

.. code-block::javascript

	{
	    "aliases": {
	        "cog": "github://sidelab/cog/cogs/$1",
	        "backbone": "github://documentcloud/backbone/backbone?v=0.5.0"
	    }
	}

This configuration file defines two aliases, `cog` and `backbone`.  If you have worked with regular expressions in the past the `$1` may catch your eye in the target path.  Essentially, interleave will create an array of regular expressions looking for each of the aliases directly followed by an exclamation mark (!).  For instance, 
if Interleave finds the following::

	//= cog!jsonp

It in actual fact, sees::

	//= github://sidelab/cog/cogs/jsonp

Which in turn, resolves to https://raw.github.com/sidelab/cog/master/cogs/jsonp.js

Personally, I think this is pretty handy. Take the [backbone](https://github.com/documentcloud/backbone) alias for instance.  You will note that we have included the version in the alias, which means that a request for::

	//= backbone!

Would resolve to a github link specifically targeting the `0.5.0` version of Backbone.  So, when it's time to upgrade our application to the next version of backbone you can simply replace the alias in the configuration file.