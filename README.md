### Notes

This repository is a fork from https://github.com/sutoiku/jsdox

Features I added:
* Index generation for your generated documentation with -i (take a look ad [index.md](sample_output/index.md))
* Recursive generation of documentation with -r (ie: documentation for subdirectories is generated too)
* Respectful recursive generation with --rr (ie: the documentation for dir1/dir2/file.js will be in output_dir/dir1/dir/file.md)

Generate the example output file with `node jsdox.js fixtures/ --rr -i -o sample_output`. You will need to delete the sample_output directory before running the tests.

# jsdox [![npm](http://img.shields.io/npm/v/jsdox.svg)](https://npmjs.org/package/jsdox) [![npm](http://img.shields.io/npm/dm/jsdox.svg)](https://npmjs.org/package/jsdox) [![build status](https://travis-ci.org/sutoiku/jsdox.svg?branch=master)](https://travis-ci.org/sutoiku/jsdox)

jsdox is a simple jsdoc 3 generator.  It pulls documentation tags based on a subset of [jsdoc 3](http://usejsdoc.org/) from your javascript files and generates [markdown](http://daringfireball.net/projects/markdown/) files.

Relies on the [JSDoc3 parser](https://github.com/mrjoelkemp/jsdoc3-parser) to get the full AST including comments.

# Resources
* [jsdox](http://jsdox.org) Documentation
* Github [repo](https://github.com/sutoiku/jsdox)
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
* Marc Trudel (stelcheck)

# License

jsdox.js is freely distributable under the terms of the MIT license.

Copyright (c) 2012-2014 Sutoiku

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.



THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
