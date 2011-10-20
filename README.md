# Interleave

I've used a few JS build tools over the last little while, and while using shell script or ANT projects to simply concatenate a number of files together into a single JS file works for some, it's [not something that I'm that content with](http://www.distractable.net/coding/javascript-builds-beyond-concatenation).

Mostly I've been using [Sprockets](https://github.com/sstephenson/sprockets) which I quite like, but it's written in Ruby and while Ruby is good, I really think I should be able to build my JS libraries using pure JavaScript ([Node.js](http://nodejs.org) in this particular case).

Also, I've had a tinker with [Sam Stephenson's](https://github.com/sstephenson) next JavaScript build tool, [Stitch](https://github.com/sstephenson/stitch) and while it's excellent I feel it is geared towards application dev rather than JS library development.

Also in the same space as Stitch (but approaching things from a different angle), we have [Ender](https://github.com/ender-js/Ender) which is another very interesting strategy for JS builds. 

So where does Interleave fit in?  Interleave attempts to provide tooling for creating JavaScript libraries, whereas Ender and Stitch both focus more on the application development space (IMO).  

Give it a try, and let me know what you think.  If it doesn't do what you need, then you definitely want to give one of the options mentioned above a go.

## Installation

Install using npm:

`npm install interleave`

## Usage

```
Usage: interleave [options] target1.js [target2.js] ..

Options:

  -h, --help                 output usage information
  -v, --version              output the version number
  -p, --path [path]          Target output path (default to current directory)
  -o, --out [outputfile]     Target output file (default to build.js)
  -m, --multi [concat|pass]  How to combine the various sources files (if multiple are provided), default = concat
  -c, --config [configfile]  The configuration file to be used for the build, default: ./build.json
```

For example, to build the example testfiles provided in the repo, you would run the following:

```
interleave testfiles/source1.js testfiles/source2.js
```

Interleave will then look for include patterns (see below) in each of the files and attempt to include files based on what it finds.

You can also tell interleave to load all the files in a particular path (or multiple paths):

```
interleave testfiles
```

## Include Patterns

An include pattern follows the same convention as [Sprockets](http://getsprockets.com/) and is a single-line comment with an equal sign straight after the two slashes: `//=`.

Unlike sprockets though interleave adopts a url like format for including files.  For instance, to include a file relative to the current file you would simply add a comment line like so:

```js
var TEST = (function() {
    //= lib/test.js
})();
```

The trailing .js is optional, so `//= lib/test` is just as valid.

### Github Includes

Now one thing I have longed for is the ability to bring in a file directly from github, so I've added support for that.  For instance, the following would bring in [underscore](https://github.com/documentcloud/underscore):


```js
//= github://documentcloud/underscore/underscore
```

Want a specific version of the library, well if the package maintainer is using [git tagging](http://learn.github.com/p/tagging.html) then you can add a version specifier:

```js
//= github://documentcloud/underscore/underscore?v=1.1.2
```

__NOTE:__ Version references can be used to access branch trees also...

### Bitbucket Includes

Just like Github includes, but for [BitBucket](http://bitbucket.org/):

```js
//= bitbucket://puffnfresh/roy/src/types
```

### Googlecode Includes

```js
//= gcode://glmatrix/hg/glMatrix
```

### HTTP Includes

Behind the scenes, the github and bitbucket includes simply wrap a standard http includer, so you can also do this:

```js
//= http://code.jquery.com/jquery-1.6.2.js
```

Kudos to [Mikeal Rogers](http://twitter.com/#!/mikeal) for his [Request](https://github.com/mikeal/request) package.  It makes this kind of thing so easy...

## Preprocessors

Starting with version `0.0.7` support for preprocessors has been added. By default, interleave reads the contents of a file and then brings it across _as is_ into the target file.  Preprocessors expand on this and can process a file prior to it being included in the combined output file.

It should be noted that __most__ preprocessors are not designed to include files from github and other remote locations so things things like their own flavours of imports, includes, etc are not likely to work.  In your own project you should, however, be able to mix and match things like CSS and Stylus, or JavaScript and CoffeeScript to your hearts content.

The list of currently supported preprocessors is below:

### Stylus

_Expected Extension: `.styl`_

You can either have `.styl` files in your sources directory and these will be converted into `.css` files in the output, or you can have plain old `.css` files in your sources with `.styl` includes:

```css
body {
	background: lime; /* everyone loves lime */
}

/*= github://LearnBoost/stylus/examples/basic.styl */
```

### CoffeeScript

_Expected Extension: `.coffee`_

Like Stylus and other extensions, CoffeeScript can also be processed as `.coffee` files in your source tree, or alternative through the standard interleave include syntax.  This allows you to mix and match your own 'hand-crafted' JS with CoffeeScript's generated JS:

```js
function MyCounter() {
    this.count = 0;
}

MyClass.prototype.increment = function() {
    this.count += 1;
};

//= github://jashkenas/coffee-script/examples/code.coffee
```

## Aliases and Build Configurations

Another feature you can use when working with Interleave are __aliases__.  Aliases are a very powerful feature that will allow you to change the location that a particular include is sourced from.  

If you are going to use aliases, you will need to make use of build configurations.  A build configuration can either be specified when doing a programmatic build or by having supplying a JSON configuration file.  By default, Interleave looks for `build.json` in the current working directory.  If found, it will load the configuration information into the executing context.

Consider the following configuration file:

```js
{
    "aliases": {
        "cog": "github://sidelab/cog/cogs/$1",
        "backbone": "github://documentcloud/backbone/backbone?v=0.5.0"
    }
}
```

This configuration file defines two aliases, `cog` and `backbone`.  If you have worked with regular expressions in the past the `$1` may catch your eye in the target path.  Essentially, interleave will create an array of regular expressions looking for each of the aliases directly followed by an exclamation mark (!).  For instance, 
if Interleave finds the following:

```js
//= cog!jsonp
```

It in actual fact, sees:

```js
//= github://sidelab/cog/cogs/jsonp
```

Which in turn, resolves to [https://raw.github.com/sidelab/cog/master/cogs/jsonp.js](https://raw.github.com/sidelab/cog/master/cogs/jsonp.js).  

Personally, I think this is pretty handy. Take the [backbone](https://github.com/documentcloud/backbone) alias for instance.  You will note that we have included the version in the alias, which means that a request for:

```js
//= backbone!
```

Would resolve to a github link specifically targeting the `0.5.0` version of Backbone.  So, when it's time to upgrade our application to the next version of backbone you can simply replace the alias in the configuration file.

## Programmatic Use

One of the things I really liked about sprockets, is how if it's command-line interface wasn't a good fit then I could use a rubygem and get a little more control.  I've tried to replicate this functionality in Interleave.

For instance, here is the `build.js` file from the Sidelab [GeoJS](https://github.com/sidelab/geojs):

```js
var interleave = require('interleave'),
    config = {
        aliases: {
            cog: 'github://sidelab/cog/cogs/$1'
        }
    };

// build each of the builds
interleave('src/geojs', {
    multi: 'pass',
    path: 'lib',
    config: config
});

interleave('src/plugins/', {
    multi: 'pass',
    path: 'lib/plugins/',
    config: config
});
```

This shows how Interleave can currently be used programmatically, but be aware that I'm probably going to change this around a little (the config being a seperate key in the options seems a little strange looking at it again now).

## Changelog

See [CHANGELOG.md](https://github.com/DamonOehlman/interleave/blob/master/CHANGELOG.md).

## To Do

- Add [UglifyJS](https://github.com/mishoo/UglifyJS) support
- Add an `npm://` loader for supported file
- Caching remote includes in a local cache

## Questions Feedback

Just drop in an [issue](https://github.com/DamonOehlman/interleave/issues), I find it works really well.

## License

[MIT](https://github.com/DamonOehlman/interleave/blob/master/LICENSE.md)