### Notes

This is a forked repository, from https://github.com/sutoiku/jsdox

This repository has been forked in order to add a multi-lines support.

With this current version, your @param, @return, .... tags can support a multi-lines descriptions support, for those
who do not want to write long lines in their source files.
With the original repository, the process won't crash, but your generated document description parts will be cut when
the parser encounters a '\n' character.
*One constraint: your functions or classes descriptions must be ABOVE your tags, unless they will ignored during the
documentation generation process.*

I didn't publish this module on NPM as I hope the original author will accept my pull request and integrate it into his
published npm package.

For now, you can install this module by cloning this repository into your 'node_modules' directory. Also, you can
integrate it into your package.json as follow:
```javascript
{
  "name": "test",
  "version": "0.0.0",
  "description": "ERROR: No README.md file found!",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "postinstall": "git clone git@github.com:stouf/jsdox.git node_modules/jsdox/"
  },
  "dependencies": {
    "socket.io": "*"
  },
  "repository": "",
  "author": "",
  "license": "BSD"
}
```

Adding the git-clone command into the 'postinstall' script will clone this repository when you'll run 'npm install' for
your project.

**Once the original author will have accepted my pull request, I will NOT delete this repository, but it will NOT be
maintained anymore.
I'll notifiy that the pull request has been accepted when it will be. When that'll so, please, use the original
repository or its associated npm package.**




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
