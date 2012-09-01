---
layout: layout
title: jsdox
subtitle: jsdoc to markdown
---

jsdox is a simple jsdoc 3 generator.  It pulls documentation tags based on a subset of [jsdoc 3](http://usejsdoc.org/) from your javascript files and generates [markdown](http://daringfireball.net/projects/markdown/) files.

<header class="jumbotron subhead" id="overview">
<div class="subnav">
<ul class="nav nav-pills">
<li><a href="#install">Install</a></li>
<li><a href="#run">Run</a></li>
<li><a href="#tests">Run the tests</a></li>
<li><a href="#api">API</a></li>
<li><a href="#tags">Tags</a></li>
<li><a href="#examples">Examples</a></li>
<li><a href="#resources">Resources</a></li>
<li><a href="#license">License</a></li>
</ul>
</div>
</header>

# Install<a name="install">&nbsp;</a>
*not setup yet*
{% highlight bash %}
$ npm install -g jsdox
{% endhighlight %}

jsdox currently relies on (at least for now) a patched version of the UglifyJS parser to get the full javascript AST including comments.

# Run<a name="run">&nbsp;</a>
Runs on a single file and outputs the markdown files into the "output" folder
{% highlight bash %}
$ jsdox file1.js
{% endhighlight %}

Runs on all the files inside folder and outputs the markdown files into the "docs" folder
{% highlight bash %}
$ jsdox --output docs folder
{% endhighlight %}

# Run the tests<a name="tests">&nbsp;</a>
Runs jshint and the few tests available under the test folder
{% highlight bash %}
$ ./run-tests.sh
{% endhighlight %}

# API<a name="api">&nbsp;</a>
To call the main jsdox function, use the following code:
{% highlight javascript %}

jsdox = require("jsdox");

jsdox.generateForDir(input, output, done);

{% endhighlight %}
* `input` is either a single file (name ends in ".js"), or a folder (one level only) that contains .js files.  Files
with other extensions will be ignored
* `output` is the destination folder
* function `done` is required and will be called when generation is complete.

# Tags<a name="tags">&nbsp;</a>
jsdox only supports a subset of the the jsdox 3 set.  Here's the list of what is currently supported (it will safely ignore any tags it does not recognize).

### @author  *text*
Blah blah blah
{% highlight bash %}
@author Joe Schmo
{% endhighlight %}

### @class *name*
Blah blah blah
{% highlight bash %}
@class  Object
{% endhighlight %}

### @copyright *text*
Blah blah blah
{% highlight bash %}
@copyright (c) 2012 Blah Blah Blah
{% endhighlight %}

### @function *name*
Blah blah blah
{% highlight bash %}
@function testAnonynous
{% endhighlight %}

### @license *text*
Specify the 
{% highlight bash %}
@license MIT
{% endhighlight %}

### @member *name*
Blah blah blah
{% highlight bash %}
@member {Sheet}  datasheet     The object's 'Data' sheet
{% endhighlight %}

### @method *name*
Blah blah blah
{% highlight bash %}
@method create
{% endhighlight %}

### @module *name*
Blah blah blah
{% highlight bash %}
@module test_module
{% endhighlight %}

### @overview *text*
Blah blah blah
{% highlight bash %}
@overview This is the overview with some `markdown` included, how nice!
{% endhighlight %}

### @param *name*
Blah blah blah
{% highlight bash %}
@param {Boolean} [optional] Changes behavior
{% endhighlight %}

### @returns [*{type}*] *text*
In functions or methods, specify what gets returned and the type of the value returned.
{% highlight bash %}
@returns {String} the result
{% endhighlight %}

### @return
See @returns

### @title *text*
Will be used as the title of the generated page
{% highlight bash %}
@title Some smart title goes here
{% endhighlight %}

# Examples<a name="examples">&nbsp;</a>

TBD

# Resources<a name="resources">&nbsp;</a>
* Githup [repo](https://github.com/psq/jsdox)
* Issue [tracker](https://github.com/psq/jsdox/issues)
* Contribute by creating [pull requests](https://github.com/psq/jsdox/pulls)!

# License<a name="license">&nbsp;</a>

jsdox.js is freely distributable under the terms of the MIT license.

Copyright (c) 2012 Sutoiku

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
