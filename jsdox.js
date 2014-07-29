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
     alias: 'o',
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
  jsdocParser = require('jsdoc3-parser'),
  Mustache = require('mustache');

/**
 * Transforms the AST into a form that represents a
 * single file with modules and their functions.
 *
 * @param {Object} ast
 * @returns {Object}
 *
 * @example
 * { functions:
 *    [ { name: 'testNamed',
 *        params: [ { name: 'file', type: 'String', value: 'filename to parse' } ],
 *        returns: '',
 *        version: '',
 *        description: 'This is a test function\nwith a description on multiple lines' },
 *      { name: 'testAnonynous',
 *        params: [],
 *        returns: 'the result',
 *        version: '',
 *        description: 'function without name',
 *        type: 'String' } ],
 *   methods: [],
 *   classes: [],
 *   modules:
 *    [ { name: 'test_module',
 *        functions:
 *         [ { name: 'testAnonynous',
 *             params: [],
 *             returns: 'the result',
 *             version: '',
 *             description: 'function without name',
 *             type: 'String' } ],
 *        classes: [],
 *        description: '' } ],
 *   global_functions:
 *    [ { name: 'testNamed',
 *        params: [ { name: 'file', type: 'String', value: 'filename to parse' } ],
 *        returns: '',
 *        version: '',
 *        description: 'This is a test function\nwith a description on multiple lines' } ],
 *   globalVariables: [],
 *   description: 'Some extra text\nSome more extra text',
 *   overview: 'This is the overview',
 *   copyright: '2012 Blah Blah Blah',
 *   license: 'MIT',
 *   author: 'Joe Schmo',
 *   version: ''
 * }
 */
function analyze(ast) {
  var result = {
    functions: [],
    methods: [],
    classes: [],
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
  currentFunction = null;

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
        if (tag.undocumented) break;

        var fn = tag;
        fn.params       = tag.params || [];
        fn.hasParams    = !!fn.params.length;
        // For the function signature
        fn.paramsString = fn.params.map(function(p) {
          return p.name;
        }).join(', ');

        // For param details
        fn.params.forEach(setPipedTypesString);
        fn.returns      = tag.returns || [];
        fn.returns.forEach(setPipedTypesString);
        // To avoid reaching to the parent for these fields
        fn.version      = tag.version || false;
        fn.fires        = tag.fires || [];
        fn.description  = tag.description;
        fn.deprecated   = tag.deprecated || false;
        fn.internal     = isInternal(fn.name);
        fn.moduleName   = currentModule ? currentModule.name : '';
        currentFunction = fn;
        if (currentClass) {
          currentClass.methods.push(fn);
          fn.className = currentClass ? currentClass.name : '';
        }
        else if (currentModule) {
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
        if (currentClass && tag.undocumented !== true) {
          currentClass.members.push(tag);
        }
        break;
      case 'return':
      case 'returns':
        if (currentFunction) {
          currentFunction.returns = tag.text;
          currentFunction.type = tag.type;
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
        klass.description = tag.description;
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

/**
 * Attaches a 'typesString' pipe-separated attribute
 * containing the node's types
 * @param {AST} node - May or may not contain a type attribute
 */
function setPipedTypesString(node) {
  if (! node.type) return '';

  node.typesString = node.type.names.join(' | ');
}

function isInternal(name){
  return name.lastIndexOf('_', 0) === 0;
}

function inspect(text) {
  return util.inspect(text, false, 20);
}

/**
 * Renders markdown from the given analyzed AST
 * @param  {Object} ast - output from analyze()
 * @return {String} Markdown output
 */
function generateMD(ast) {
  if (!ast) return 'no analyzed ast to generate markdown from';

  var templates = {
    file: fs.readFileSync(__dirname + '/templates/file.mustache').toString(),
    class: fs.readFileSync(__dirname + '/templates/class.mustache').toString(),
    function: fs.readFileSync(__dirname + '/templates/function.mustache').toString()
  };

  return Mustache.render(templates.file, ast, templates);
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
        console.log(file + ' AST: ', util.inspect(result, false, 20));
        console.log(file + ' Analyzed: ', util.inspect(analyze(result), false, 20));
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
  console.log('  -o, --output\t\t Output directory.');
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
      printHelp();
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
