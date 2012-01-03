<img src="https://github.com/DamonOehlman/interleave/raw/master/assets/interleave-logo.png " title="Interleave" />

Interleave is a tool that helps you organise and "compile" your JS in a [beyond concatenation](http://www.distractable.net/coding/javascript-builds-beyond-concatenation) way.  It allows you to not only include files from your local file system, but remotely from [Github](http://github.com/), [Bitbucket](http://bitbucket.org) (and other) online sources.

## Installation

Install using [npm](http://npmjs.org/):

`npm install -g interleave`

## Usage

Interleave is designed as a command-line tool, but also supports [programmatic use](http://interleave.readthedocs.org/en/latest/programmatic-use.html).  In the simplest case, where you have a single input file to be processed you would probably run:

```
interleave src/main.js
```

This would parse the `main.js` file in the `src` folder and generate a `main.js` in a `dist` folder.  If the dist folder does not exist, then it will be automatically created.

Alternatively you can also call interleave and just specify that you want it to process the `src` directory.  In this case, each of the files (_not recursive_) in the `src` folder would be processed individually and pushed to the `dist` folder.

## Full Documentation

Full documentation for Interleave is available at:

[http://interleave.readthedocs.org/](http://interleave.readthedocs.org/)

## Changelog

See [CHANGELOG.md](https://github.com/DamonOehlman/interleave/blob/master/CHANGELOG.md).

## To Do

- Add real tests instead of just an example
- Add an `npm://` loader for supported file
- Caching remote includes in a local cache

## Questions Feedback

Just drop in an [issue](https://github.com/DamonOehlman/interleave/issues), I find it works really well.

## License

[MIT](https://github.com/DamonOehlman/interleave/blob/master/LICENSE.md)