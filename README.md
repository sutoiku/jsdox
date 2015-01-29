# jsdox [![npm](http://img.shields.io/npm/v/jsdox.svg)](https://npmjs.org/package/jsdox) [![npm](http://img.shields.io/npm/dm/jsdox.svg)](https://npmjs.org/package/jsdox) [![build status](https://travis-ci.org/sutoiku/jsdox.svg?branch=master)](https://travis-ci.org/sutoiku/jsdox)

jsdox is a simple jsdoc 3 generator.  It pulls documentation tags based on a subset of [jsdoc 3](http://usejsdoc.org/) from your javascript files and generates [markdown](http://daringfireball.net/projects/markdown/) files.

Relies on the [JSDoc3 parser](https://github.com/mrjoelkemp/jsdoc3-parser) to get the full AST including comments.

### CLI Options

Usage: `jsdox [options] <file | directory>`

`--config <file>` (alias `-c`): Configuration JSON file.

`--All` (alias `-A`): Generates documentation for all available elements including internal methods.

`--debug` (alias `-d`): Prints debugging information to the console.

`--help` (alias `-H`): Prints help and quits.

`--version` (alias `-v`): Prints the current version and quits.

`--output <dir>` (alias `-o`): Output directory. Default value is `output`.

`--templateDir <dir>` (alias `-t`): Template directory to use instead of built-in ones.

`--index <name>` (alias `-i`): Generates an index with the documentation. An optional file name can be provided as an argument. Default value is `index`.

`--index-sort <type>`: Defines how to sort the index.  Options are: `standard` (sorted by name), `namespace` (sorted by package/module and name), and `none` (not sorted). Default value is `standard`.

`--recursive` (alias `-r`): Generates documentation in all subdirectories of the source folder.

`--respect-recursive` (alias `--rr`): Generate subdirectories and copy the original organization of the sources.


# Resources
* [jsdox](http://jsdox.org) Documentation
* Github [repo](https://github.com/sutoiku/jsdox)
* [Changelog](https://github.com/sutoiku/jsdox/blob/master/CHANGES.md)
* Issue [tracker](https://github.com/sutoiku/jsdox/issues)
* Contribute by [reading the guidelines](https://github.com/sutoiku/jsdox/blob/master/Contributing.md) and creating [pull requests](https://github.com/sutoiku/jsdox/pulls)!
* Run the test suite using `npm test`

# Related projects
* [grunt-jsdox](https://github.com/mmacmillan/grunt-jsdox) A grunt task
  to run jsdox on your project

# Author and contributors
* Pascal Belloncle (psq, Original author)
* Sam Blowes (blowsie)
* Todd Henderson (thenderson21)
* Nic Jansma (nicjansma)
* Joel Kemp (mrjoelkemp)
* Ron Korving (ronkorving)
* Mike MacMillan (mmacmillan)
* Michael Martin-Smucker (mlms13)
* Akeem McLennon (bluelaguna)
* Gabor Sar (gaborsar)
* Marc Trudel (stelcheck)
* Vladimir de Turckheim (vdeturckheim)

# License

jsdox.js is freely distributable under the terms of the MIT license.

Copyright (c) 2012-2015 Sutoiku

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.



THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
