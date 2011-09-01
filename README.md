# Interleave

I have searched the Interwebz for a good Javascript build tool.  I have definitely found one or two that I have liked, but none that have really ever properly scratched the itch.

This is an attempt to scratch the itch.

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