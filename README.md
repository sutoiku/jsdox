### Notes

This repository is a fork from https://github.com/sutoiku/jsdox

The original repository works perfectly, except the fact that it doesn't allow the text following your tags (@param,
@return, etc...) to be written on multiple lines. Thus, I've forked this repository in order to implement this feature.

You can install this project into your node.js project using the famous lovely package.json file and npm as follow:

```javascript
{
  "name": "test",
  "version": "0.0.0",
  "description": "ERROR: No README.md file found!",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  "dependencies": {
    "socket.io": "*",
    "jsdox": "git@github.com:stouf/jsdox.git"
  },
  "repository": "",
  "author": "",
  "license": "BSD"
}
```

Then, simply run your **npm install** and / or **npm update** like you use to do ;-)

**Once the author of the original repository will have accepted my pull request, I will NOT delete this repository,
but it will NOT be maintained anymore.
I'll notifiy that the pull request will have been accepted when it will be the case. When that'll so, please,
use the original repository or its associated npm package.**




# jsdox.js

jsdox is a simple jsdoc 3 generator.  It pulls documentation tags based on a subset of [jsdoc 3](http://usejsdoc.org/) from your javascript files and generates [markdown](http://daringfireball.net/projects/markdown/) files.

Relies on (for now) patched version of the UglifyJS parser to get the full AST including comments

# Resources
* [jsdox](http://jsdox.org) Documentation 
* Github [repo](https://github.com/sutoiku/jsdox)
* Issue [tracker](https://github.com/sutoiku/jsdox/issues)
* Contribute by creating [pull requests](https://github.com/sutoiku/jsdox/pulls)!

# Author and Maintainers
* Pascal Belloncle (Original author)
* Marc Trudel

# License

jsdox.js is freely distributable under the terms of the MIT license.

Copyright (c) 2012-2013 Sutoiku

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
