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

  -h, --help                          output usage information
  -v, --version                       output the version number
  -p, --path [path]                   Target output path (default to current directory)
  -f, --file [file]                   Target output file (default to build.js)
  -c, --combine [concat|passthrough]  How to combine the various sources files (if multiple are provided)
```

For example, to build the example testfiles provided in the repo, you would run the following:

`interleave testfiles/source1.js testfiles/source2.js`