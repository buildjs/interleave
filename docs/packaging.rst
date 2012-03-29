.. highlight:: javascript

.. _packaging:

===================
Packaging Libraries
===================

You can run interleave in packaging mode by using the ``--package`` flag.  Why should you consider doing this?  Well, read on...

The way we build JS application is changing, and while I'm still very much a fan of precompiling assets into a single JS file for a production release, the `AMD <https://github.com/amdjs>`_ movement is definitely challenging my thinking.

If you haven't yet heard of AMD, or like me you aren't quite sold on it yet, then it's probably worth having a read of `Addy Osmani <http://twitter.com/addyosmani>`_'s `Writing Modular JS article <http://addyosmani.com/writing-modular-js/>`_.

It has definitely struck me that we need to move beyond writing no-dependencies Javascript, which while I understand and subscribe to the notion doesn't help progress the way we build JS applications.  Not really anyway.

Write Once, and then Package
============================

So with an increasing interest in AMD, and the desire to write my code once and have it work for both the browser and Node, I've added some packaging functionality to Interleave.  At this point, I'm sure some of you are just saying "Hey all you need to do is detect for module.exports, define, etc, etc and your code will work in all environments".  Well, yes that's true when you have zero-dependencies but not when you do.  This is something that interleave takes care of for you.

As an example, let's have a look at the `registry project <https://github.com/DamonOehlman/registry>`_ that I've used to test the packaging functionality.

First a snippet from the `main source file <https://github.com/DamonOehlman/registry/blob/master/src/registry.js>`_::

    // dep: wildcard, matchme
    var definitions = {};
    
    //= core/events
    //= core/definition
    //= core/results

    ...

    function registry(namespace, test) {
        ...
    }

    ... 

    // event handling
    registry.bind = _bind;
    registry.unbind = _unbind;

There are a couple of special comments in the above file which make both the interleave build process, and then the subsequent packaging process work nicely.

Firstly, we have the standard interleave include comments (``//=``) that tell interleave to include the contents of those files (be they local or remote) inline and replace the comment.  For more information on these see :ref:`include patterns`.

Secondly, we have the dependency comment line (``// dep: lib1, lib2``) which I started using while working on `BakeJS <https://github.com/DamonOehlman/bake-js>`_.  Bake is a supporting tool to interleave is currently designed to assist with packaging JS application files using many `microjs <http://microjs.com/>`_ libraries.  At this stage, Bake does not support AMD, but I'm considering how that could be added. 

Specifying the dependencies in your sources is what's required to make packaging work, and work well.  While the dependency comment in the above example is shown at the top of the file, it can be included anywhere in the file as long as it is a standalone comment line (i.e. it won't be picked up as a trailing comment after a statement).

These dependency comment lines are then extracted from the file content, and used to generate the various different flavours of packages.

Package Types
=============

Four package types are currently implemented, and produce different output designed to work in different scenarios.

Raw Packages
------------

The raw package is output the takes the interleaved file output (with includes resolved) and provides the output with no extra trimmings.  If you have a look at the `registry example <https://github.com/DamonOehlman/registry/blob/master/pkg/raw/registry.js>`_ you will notice that the includes have been resolved to their actual contents but nothing more has been added.

Old School Packages
-------------------

Old school packages are simply the raw code wrapped in an anonymous function to prevent polluting the global scope with all your top level functions and variables.  The registry example wrapped up old school style simply becomes::

    // dep: wildcard, matchme

    (function (glob) {
      ...
  
      glob.registry = registry;
  
    })(this);
    
While I considered adding the universal module.exports, define compatible export to this type of package I decided against it to encourage people to consider using the specific package better suited to their needs instead.

`Old School registry example <https://github.com/DamonOehlman/registry/blob/master/pkg/oldschool/registry.js>`_

CommonJS Packages
-----------------

The CommonJS packager creates a `CommonJS 1.0 Module <http://wiki.commonjs.org/wiki/Modules/1.0>`_ that you would use in something like Node.  From the dependency comments outlined in the source files, require statements are created and output similar to the following will be created::

    var wildcard = require('wildcard'),
        matchme = require('matchme');

    ...

    module.exports = registry;

`CJS registry example <https://github.com/DamonOehlman/registry/blob/master/pkg/cjs/registry.js>`_

AMD Packages
------------

Finally, we get to AMD, which I think I've already said enough about so here's the an example snippet::

    define('registry', ['wildcard', 'matchme'], function(wildcard, matchme) {
      var definitions = {};
      
      ...
  
      return registry;
    });
    
`AMD registry example <https://github.com/DamonOehlman/registry/blob/master/pkg/amd/registry.js>`_