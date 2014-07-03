/*
Copyright (c) 2012 Pascal Belloncle

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var
  util = require('util'),
  fs   = require('fs'),
  path = require('path'),
  q    = require('q'),
  argv = require('optimist')
    .options('output', {
     alias: 'out',
     'default':'output'
    })
    .options('config',{
     alias: 'c'
    })
    .options('version',{
     alias: 'v'
    })
    .options('help',{
     alias: 'h'
    })
    .boolean('A', 'd')
    .options('A',{
     alias: 'All'
    })
    .options('d',{
     alias: 'debug'
    })
    .argv,
  packageJson = require('./package.json'),
  jsdocParser = require('jsdoc3-parser');

function inspect(text) {
  return util.inspect(text, false, 20);
}

// [ { text: '',
//   tags:
//    [ { tag: 'overview',
//        tagValue: 'This is the overview',
//        value: 'This is the overview' },
//      { tag: 'copyright',
//        tagValue: '2012 Blah Blah Blah',
//        value: '2012 Blah Blah Blah' } ] },
// { text: 'This is a test function\nwith a description on multiple lines',
//   tags:
//    [ { tag: 'param',
//        tagValue: '{String} file filename to parse',
//        type: 'String',
//        name: 'file',
//        value: 'filename to parse' } ] },
// { text: '',
//   generated: true,
//   tags:
//    [ { tag: 'function',
//        tagValue: 'test',
//        name: 'test' } ] },
// { text: 'function without name',
//   tags:
//    [ { tag: 'function',
//        tagValue: 'test2',
//        name: 'test2' },
//      { tag: 'returns',
//        tagValue: 'null',
//        name: 'null' } ] } ]

/**
  analyze one file
*/

function analyze(ast) {
  var result = {
    functions: [],  // which module, list of params + returns
    methods: [],  // which class
    classes: [],  // which module
    modules: [],
    globalModule: null,
    globalVariables: [],
    description: '',
    overview: '',
    copyright: '',
    license: '',
    author: '',
    version: ''
  },
  currentModule   = null,
  currentClass    = null,
  currentFunction = null,
  currentMethod   = null;

  function initGlobalModule() {
    var global = {};
    global.name      = 'Global';
    global.functions = [];
    global.classes   = [];

    result.modules.push(global);
    result.globalModule = global;
  }

  if (!ast) {
    return null;
  }

  ast.forEach(function (tag) {
    switch (tag.kind) {
      case 'file':
        result.license   = tag.license;
        result.author    = tag.author;
        result.copyright = tag.copyright;
        result.overview  = tag.description;

        (currentFunction || result).version = tag.version;
        (currentFunction || result).deprecated = tag.deprecated || true;

        break;
      case 'function':
        var fn = {};
        fn.name         = tag.name;
        fn.params       = tag.params || [];
        fn.returns      = tag.returns || [];
        fn.version      = '';
        fn.fires        = tag.fires || [];
        fn.description  = tag.description;
        fn.internal     = isInternal(fn.name);
        currentFunction = fn;
        currentMethod   = null;
        if (currentModule) {
          currentModule.functions.push(fn);
        } else {
          if (!result.globalModule) {
            initGlobalModule();
          }
          result.globalModule.functions.push(fn);
        }
        result.functions.push(fn);
        break;
      case 'emits':
      case 'fires':
        fn.fires.push(tag.name);
        break;
      case 'member':
        if (currentClass) {
          currentClass.members.push(tag);
        }
        break;
      case 'return':
      case 'returns':
        if (currentFunction) {
          currentFunction.returns = tag.text;
          currentFunction.type = tag.type;
        } else if (currentMethod) {
          currentMethod.returns = tag.text;
          currentMethod.type = tag.type;
        }
        break;
      case 'module':
        var module = {};
        module.name = tag.name;
        module.functions = [];
        module.classes = [];
        module.description = tag.description;
        result.modules.push(module);
        currentModule = module;
        break;
      case 'class':
        var klass = {};
        klass.name = tag.name;
        klass.methods = [];
        klass.members = [];
        klass.description = tag.text;
        result.classes.push(klass);
        if (currentModule) {
          currentModule.classes.push(klass);
        } else {
          if (!result.globalModule) {
            initGlobalModule();
          }
          result.globalModule.classes.push(klass);
        }
        currentClass = klass;
        break;
    }
  });
  return result;
}

function isInternal(name){
  return name.lastIndexOf('_', 0) === 0;
}

function generateH1(text) {
  return text + '\n' +
      '===================================================================================================='.
      substr(0, text.length) + '\n';
}

function generateH2(text) {
  return text + '\n' +
      '----------------------------------------------------------------------------------------------------'.
      substr(0, text.length) + '\n';
}

function generateH3(text) {
  return '###' + text + '###\n';
}

function generateList(list) {
  var out = '';
  for (var i = 0; i < list.length; i++) {
    out += '* ' + list[i] + '\n';
  }
  return out + '\n';
}

function generateCode(code, nl) {
  return '`' + code + '`' + (nl ? '\n\n' : '');
}

function generateCodeBlock(code, lang) {
  return '\n```' + lang +'\n' + code + '\n```\n';
}

function generateLine() {
  return '---\n\n';
}

function generateURL(text, url, nl) {
  return '[' + text + '](' + url + ')' + (nl ? '\n\n' : '');
}

function generateText(text, nl) {
  return (text ? text.replace(/\n/g, '\n') : '\n') + (nl ? '\n\n' : '');
}

function generateStrong(text, nl) {
  return '**' + text + '**' + (nl ? '\n\n' : '');
}

/**
 * @param  {String|Array} - text
 * @param  {Boolean} nl   - Whether or not to add newlines to the end of each line
 * @return {String}
 */
function generateEm(text, nl) {
  if (text instanceof Array) {
    if (text.length > 1) {
      // Intentionally ignore newlines for multiple items
      return text.map(function(text) {
        return generateEm(text);
      }).join(' | ');

    } else {
      text = text[0];
    }
  }

  return '*' + text + '*' + (nl ? '\n\n' : '');
}

function filterMD(text) {
  return text.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

function generateFunctionsForModule(module, displayName) {
  function generateFunction(prefix, fn) {
    if (! fn.internal || argv.All) {
      var proto = prefix;
      proto += fn.name + '(';
      // @todo: simplify with a map and join
      for (var j = 0; j < fn.params.length; j++) {
        proto += filterMD(fn.params[j].name);
        if (j !== fn.params.length-1) {
          proto += ', ';
        }
      }
      proto += ')';
      out += generateH2(proto);
      if (fn.description) {
        out += generateText(fn.description, true);
      }
      if (fn.deprecated) {
        if (typeof fn.deprecated === 'boolean') {
          out += generateText('**Deprecated**', true);
        } else {
          out += generateText('**Deprecated:** ' + fn.deprecated, true);
        }
      }
      if (fn.params.length) {
        out += generateStrong('Parameters', true);
        fn.params.forEach(function (param) {
          out += generateStrong(param.name);
          if (param.type) {
            out += ':  ' + generateEm(param.type.names);
          }
          out += ',  ' + generateText(param.description, true);
        });
      }
      if (fn.returns.length) {
        fn.returns.forEach(function (returns) {
          out += generateStrong('Returns', true);
          if (returns.type) {
            out += generateEm(returns.type.names) + ',  ';
          }
          out += generateText(returns.description, true);
        });
      }
      if (fn.fires.length) {
        fn.fires.forEach(function(eventName) {
          out += generateStrong('Fires') + ': ';
          out += generateText(eventName, true);
        });
      }
    }
  }

  var out = '';
  if (displayName) {
    out += generateH1('module ' + module.name);
  }
  if (module.description) {
    out += generateText(module.description, true);
  }

  for (var i = 0; i < module.functions.length; i++) {
    var fn = module.functions[i];
    var proto = '';
    if (module.name !== 'Global') {
      proto += module.name + '.';
    }
    generateFunction(proto, fn);
  }

  for (i = 0; i < module.classes.length; i++) {
    var klass = module.classes[i];
    var classname = '';
    if (module.name !== 'Global') {
      classname += module.name + '.';
    }
    classname += klass.name;
    out += generateH2('class ' + classname);
    if (klass.members.length) {
      out += generateStrong('Members', true);
      for (var j = 0; j < klass.members.length; j++) {
        var member = klass.members[j];
        out += generateStrong(member.name);
        if (member.type) {
          out += ':  ' + generateEm(member.type);
        }
        out += ',  ' + generateText(member.value, true);
      }
    }
    if (klass.methods.length) {
      out += generateStrong('Methods', true);
      for (var k = 0; k < klass.methods.length; k++) {
        var method = klass.methods[k];
        generateFunction(classname + '.', method);
      }
    }

  }
  return out;
}

// { functions:
//    [ { name: 'testNamed',
//        params: [ { name: 'file', type: 'String', value: 'filename to parse' } ],
//        returns: '',
//        version: '',
//        description: 'This is a test function\nwith a description on multiple lines' },
//      { name: 'testAnonynous',
//        params: [],
//        returns: 'the result',
//        version: '',
//        description: 'function without name',
//        type: 'String' } ],
//   methods: [],
//   classes: [],
//   modules:
//    [ { name: 'test_module',
//        functions:
//         [ { name: 'testAnonynous',
//             params: [],
//             returns: 'the result',
//             version: '',
//             description: 'function without name',
//             type: 'String' } ],
//        classes: [],
//        description: '' } ],
//   global_functions:
//    [ { name: 'testNamed',
//        params: [ { name: 'file', type: 'String', value: 'filename to parse' } ],
//        returns: '',
//        version: '',
//        description: 'This is a test function\nwith a description on multiple lines' } ],
//   globalVariables: [],
//   description: 'Some extra text\nSome more extra text',
//   overview: 'This is the overview',
//   copyright: '2012 Blah Blah Blah',
//   license: 'MIT',
//   author: 'Joe Schmo',
//   version: '' }

function generateMD(data) {
  if (!data) {
    return 'no data to generate from';
  }
  var out = '';

  if (data.copyright) {
    out += generateEm(/*'©' +*/ data.copyright, true);
  }

  if (data.overview) {
    out += generateStrong('Overview:') + ' ' + generateText(data.overview, true);
  }

  if (data.author) {
    data.author.forEach(function(author) {
      out += generateStrong('Author:') + ' ' + generateText(author, true);
    });
  }

  if (data.description) {
    out += generateText(data.description, true);
  }

  for (var i = 0; i < data.modules.length; i++) {
    out += generateFunctionsForModule(data.modules[i], (data.modules.length > 1));
  }

  return out;
}

function generateForDir(filename, destination, cb, fileCb) {
  var waiting = 0;
  var touched = 0;
  var error = null;

  function oneFile(directory, file, cb) {
    var fullpath = path.join(destination, file);
    fullpath = fullpath.replace(/\.js$/, '.md');
    if (argv.debug) {
      console.log('Generating', fullpath);
    }
    waiting++;
    jsdocParser(path.join(directory, file), function(err, result) {
      if (err) {
        console.error('Error generating docs for file', file, err);
        waiting--;
        if (!waiting) {
          return cb(err);
        } else {
          error = err;
        }
      }

      if (argv.debug) {
        console.log(file, util.inspect(result, false, 20));
        console.log(file, util.inspect(analyze(result), false, 20));
      }

      var data = analyze(result),
          output = generateMD(data);

      if (output) {
        fileCb && fileCb(file, data);
        fs.writeFile(fullpath, output, function(err) {
          waiting--;
          if (err) {
            console.error('Error generating docs for file', file, err);
            error = err;
          }
          if (!waiting) {
            return cb(error);
          }
        });
      } else {
        waiting--;
        if (!waiting) {
          return cb(error);
        }
      }
    });
  }


  if (filename.match(/\.js$/)) {
    oneFile(path.dirname(filename), path.basename(filename), cb);
  } else {
    fs.stat(filename, function (err, s) {
      if (!err && s.isDirectory()) {
        fs.readdir(filename, function(err, files) {
          if (err) {
            console.error('Error generating docs for files', filename, err);
            return cb(err);
          }
          files.forEach(function(file) {
            if (file.match(/\.js$/)) {
              oneFile(filename, file, cb), touched++;
            }
          });
          if(!touched) {
            cb();
          }
        });
      } else {
        cb();
      }
    });
  }
}

function loadConfigFile(file, callback){
  var config;

  //check to see if file exists
  fs.exists(file, function(exists) {
    if (exists) {
      try {
        config = require(file);
      } catch(err) {
        console.error('Error loading config file: ', err);
        process.exit();
      }
      for(var key in config){
        if (key !== 'input'){
        argv[key] = config[key];
        } else {
        argv._[0] = config[key];
        }
      }
      callback();
    } else {
      console.error('Error loading config file: ', file);
      process.exit();
    }
  });
}

function printHelp(){
  console.log('Usage:\tjsdox [options] <file | directory>');
  console.log('\tjsdox --All --output docs folder\n');
  console.log('Options:');
  console.log('  -c, --config \t<file>\t Configuration JSON file.');
  console.log('  -A, --All\t\t Generates documentation for all available elements including internal methods.');
  console.log('  -d, --debug\t\t Prints debugging information to the console.');
  console.log('  -H, --help\t\t Prints this message and quits.');
  console.log('  -v, --version\t\t Prints the current version and quits.');
  console.log('  -out, --output\t\t Output directory.');
  process.exit();
}

function printVersion(){
  console.log('Version: ' + packageJson.version);
  process.exit();
}

function jsdox() {
  //Handle options
  if(argv.help){
   printHelp();
  }

  if(argv.version){
   printVersion();
  }

  if(argv.config){
  loadConfigFile(argv.config, main);
  } else {
  main();
  }

  function main(){
    if(typeof argv._[0] !== 'undefined'){
      fs.mkdir(argv.output, function() {
        q.all(argv._.map(function(file) {
          var deferred = q.defer();

          generateForDir(file, argv.output, function(err) {
            if (err) {
              console.error(err);
              throw err;
            }

            deferred.resolve();
          });

          return deferred.promise;
        }))
        .then(function () {
          console.log('jsdox completed');
        });
      });
    } else {
      console.error('Error missing input file or directory.');
    }
  }
}

exports.analyze = analyze;
exports.generateMD = generateMD;
exports.generateForDir = generateForDir;
exports.jsdox = jsdox;

if (require.main === module) {
  jsdox();
}
