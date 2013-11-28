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
  fs = require('fs'),
  path = require('path'),
  argv = require('optimist')['default']('output', 'output').argv,
  uglify = require('uglify-js'),
  jsp = uglify.parser,
  ast_walker = uglify.uglify.ast_walker;

var TAGS = {
  "constructor": parseTypeName,
  "author": parseName,
  "class": parseName,
  "classdesc": parseText,
  "constant": parseTypeName,
  "const": parseTypeName,
  "copyright": parseText,
  "default": parseValue,
  "deprecated": parseNothing,
  "description": parseText,
  "desc": parseText,
  "enum": parseType,
  "throws": parseName,
  "exception": parseName,
  "exports": parseName,
  "module": parseName,
  "overview": parseText,
  "file": parseText,
  "fileoverview": parseText,
  "function": parseName,
  "method": parseName,
  "member": parseTypeName,
  "global": parseNothing,
  "ignore": parseNothing,
  "license": parseText,
  "param": parseTypeName,
  "arg": parseTypeName,
  "argument": parseTypeName,
  "private": parseNothing,
  "property": parseTypeName,
  "protected": parseNothing,
  "public": parseNothing,
  "readonly": parseNothing,
  "requires": parseList,
  "returns": parseTypeText,
  "return": parseTypeText,
  "see": parseName,
  "since": parseText,
  "summary": parseText,
  "this": parseName,
  "type": parseType,
  "version": parseText,
  "title": parseText
};

function inspect(text) {
  return util.inspect(text, false, 20);
}

function parseNothing(text, tag, lineNo) {
  if (stripSpaces(text) !== '') {
    console.warn(lineNo + ': ' + tag.tag + ' should not have data');
  }
}

function parseName(text, tag, lineNo) {
  tag.name = text;
}

function parseText(text, tag, lineNo) {
  tag.value = text;
}

function parseType(text, tag, lineNo) {
  var trimmed = stripSpaces(text);
  if (trimmed[0] !== '{' && trimmed[trimmed.length-1] !== '}') {
    console.warn(lineNo + ': type format incorrect (' + trimmed + ')');
  }
  tag.type = trimmed.substr(1, trimmed.length-2);
}

function parseTypeName(text, tag, lineNo) {
  var typeEndIndex = text.indexOf('}');
  if (typeEndIndex !== -1) {
    parseType(text.substr(0, typeEndIndex + 1), tag, lineNo);
    text = stripSpaces(text.substr(typeEndIndex + 1));
  }
  var components = text.split(' ');
  tag.name = components.shift();
  var value = stripSpaces(components.join(' '));
  if (value.length) {
    tag.value = value;
  }
}

function parseTypeText(text, tag, lineNo) {
  var typeEndIndex = text.indexOf('}');
  if (typeEndIndex !== -1) {
    parseType(text.substr(0, typeEndIndex + 1), tag, lineNo);
    text = stripSpaces(text.substr(typeEndIndex + 1));
  }
  tag.text = text;
}

/*
  comma separated list
*/
function parseList(text, tag, lineNo) {
  tag.value = text.split(',');
  for (var i = 0; i < tag.value.length; i++) {
    tag.value[i] = stripSpaces(tag.value[i]);
  }
}

function parseValue(text, tag, lineNo) {
  tag.value = text;
}

function isDocComment(text, lineNo) {
  if (text.length > 2) {
    if (text[0] === '*' && text[1] !== '*') {
      return true;
    }
  }
  return false;
}

function hasTag(text) {
  var tagIndex = text.indexOf('@');
  if (tagIndex === -1) {
    return null;
  }
  return text.substr(tagIndex+1).split(' ')[0];
}

function stripStarsAndSpaces(text) {
  return text.replace(/^\s+\**\s*|^\*+\s*|\s+$/g, '');
}

function stripSpaces(text) {
  return text.replace(/^\s+|\s+$/g, '');
}

function parseLine(text, lineNo) {
  var tag = hasTag(text);
  if (tag) {
    var result = {};
    result.tag = tag;
    result.tagValue = stripSpaces(text.substr(text.indexOf('@'+tag) + tag.length + 1));
    if (TAGS.hasOwnProperty(tag)) {
      TAGS[tag](result.tagValue, result);
    } else {
      console.warn(lineNo + ': Tag not supported: ' + tag);
    }
    return result;
  } else if (text.match(/#TEST:/)) {
    return null;
  } else if (text.match(/#TODO:/)) {
    return null;
  } else {
    return stripStarsAndSpaces(text);
  }
}

function parseComment(text, lineNo, parse) {
  if (isDocComment(text)) {
    var result = {
      text: "",
      tags: []
    };
    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var parsed = parse(lines[i], lineNo + i);
      if (typeof parsed === 'string') {
        if (result.text.length === 0) {
         result.text = parsed;
        } else {
          result.text += '\n' + parsed;
        }
      } else if (parsed) {
        result.tags.push(parsed);
      }
    }
    return result;
  } else {
    return null;
  }
}

function commentHasTag(comment, tag) {
  for (var i = 0; i < comment.tags.length; i++) {
    if (comment.tags[i].tag === tag) {
      return comment.tags[i];
    }
  }
  return null;
}

function parseComments(ast) {
  var
    w = ast_walker(),
    walk = w.walk,
    result = [];

    function hasComments(args) {
      if (args.length) {
        var arg = args[args.length-1];
        if (arg && arg.comments_before) {
          return arg.comments_before;
        }
      }
      return null;
    }

    // function: { '0': null,
    //   '1': [],
    //   '2': [ [ 'return', [ 'num', 0 ] ] ],
    //   '3':
    //    { comments_before:
    //       [ { type: 'comment2',
    //           value: '*\n    second function without name\n    @returns {String} the result\n  ',
    //           line: 56,
    //           col: 2,
    //           pos: 1169,
    //           endpos: 1243,
    //           nlb: true } ] } }

    // [ 'stat',
    //   [ 'assign',
    //     true,
    //     [ 'dot', [ 'name', 'exports' ], 'exported' ],
    //     [ 'function', null, [ 'param' ], [ [ 'return', [ 'num', 5 ] ] ] ] ],
    //   comments_before: [ { type: 'comment2',
    //       value: '*\n * exported with dot notation\n * @param {String} param the parameter\n ',
    //       line: 36,
    //       col: 0,
    //       pos: 612,
    //       endpos: 688,
    //       nlb: true } ] ],

    function saveFunctionOrMethodName(name, parsed) {
      if (name) {
        var fn = commentHasTag(parsed, 'function');
        var method = commentHasTag(parsed, 'method');
        var klass = commentHasTag(parsed, 'class');
        if (method) {
          if (!method.name) {
            method.name = name;
          }
        } else if (fn && !fn.name) {
          fn.name = name;
        } else if (!klass) {
          parsed.tags.unshift({
            tag: "function",
            tagValue: name,
            name: name
          });
        }
      }
    }

    function v() {
      var comments = hasComments(arguments);
      if (comments) {
        var fname = '';
        var resultAfter = [];
        var vv = arguments[0];
        if ((vv.length >= 3) && vv[0] === 'assign' && vv[3]) {
          // [ 'name', 'global' ]
          // [ 'dot', [ 'name', 'exports' ], 'exported' ]
          if (vv[2][0] === 'name') {
            fname = vv[2][1];
          } else if (vv[2][0] === 'dot') {
            fname = vv[2][2];
          }
        } else {
          for (var j = 0; j < vv.length; j++) {
            if (vv[j][1] && vv[j][1].comments_before) {
              for (var k = 0; k < vv[j][1].comments_before.length; k++) {
                var comment2 = vv[j][1].comments_before[k];
                if (comment2.type === 'comment2') {
                  var parsed2 = parseComment(comment2.value, comment2.line, parseLine);
                  if (parsed2) {
                    saveFunctionOrMethodName(vv[j][0], parsed2);
                    resultAfter.push(parsed2);
                  }
                }
              }
            }
          }


        }

        for (var i = 0; i < comments.length; i++) {
          var comment = comments[i];
          if (comment.type === 'comment2') {
            var parsed = parseComment(comment.value, comment.line, parseLine);
            if (parsed) {
              saveFunctionOrMethodName(fname, parsed);
              result.push(parsed);
            }
          }
        }

        result = result.concat(resultAfter);
      }
    }

    function stat() {
      var fname = '';
      var resultAfter = [];
      var vv = arguments[0];

      if ((vv.length >= 3) && vv[0] === 'assign' && vv[3] && vv[3].length > 0 && vv[3][0] === 'function') {
        // [ 'name', 'global' ]
        // [ 'dot', [ 'name', 'exports' ], 'exported' ]
        if (vv[2][0] === 'name') {
          fname = vv[2][1];
        } else if (vv[2][0] === 'dot') {
          fname = vv[2][2];
        }
      }

      var comments = hasComments(arguments);
      if (comments) {
        for (var i = 0; i < comments.length; i++) {
          var comment = comments[i];
          if (comment.type === 'comment2') {
            var parsed = parseComment(comment.value, comment.line, parseLine);
            if (parsed) {
              if (i === comments.length-1) {
                saveFunctionOrMethodName(fname, parsed);
              }
              result.push(parsed);
            }
          }
        }
      }
    }

    function defun() {
      var comments = hasComments(arguments);
      if (comments) {
        for (var i = 0; i < comments.length; i++) {
          var comment = comments[i];
          if (comment.type === 'comment2') {
            var parsed = parseComment(comment.value, comment.line, parseLine);
            if (parsed) {
              if (i === comments.length-1) {
                saveFunctionOrMethodName(arguments[0], parsed);
              }
              result.push(parsed);
            }
          }
        }
      }
    }

    function obj() {
      if (arguments[0] && arguments[0].length) {
        for (var i = 0; i < arguments[0].length; i++) {
          var comments = arguments[0][i].comments_before;
          if (comments) {
            for (var j = 0; j < comments.length; j++) {
              var comment = comments[j];
              if (comment.type === 'comment2') {
                var parsed = parseComment(comment.value, comment.line, parseLine);
                if (parsed) {
                  if (arguments[0][i][1][0] === 'function') {
                    if (j === comments.length-1) {
                      if (!commentHasTag(parsed, 'function')) {
                        parsed.tags.unshift({
                          tag: "function",
                          tagValue: arguments[0][i][0],
                          name: arguments[0][i][0]
                        });
                      }
                    }
                  }
                  result.push(parsed);
                }
              }
            }
          }
        }
      }
    }

  w.with_walkers({
      "var": v,
      "stat": stat,
      "defun": defun,
      "object": obj
    }, function() {
      return walk(ast);
  });
  return result;
}

function parseFile(file, cb) {
  fs.readFile(file, function (err, data) {

    var result;

    if (err) {
      return cb(err);
    }
    try {
      var ast = jsp.parse(data.toString());
      if (argv.debug) {
        console.log(util.inspect(ast, false, 20));
      }

      result = parseComments(ast);
    } catch(e) {
      // console.log(e);
      return cb(e);
    }
    return cb(null, result);
  });
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

function analyze(raw) {
  var result = {
    functions: [],  // which module, list of params + returns
    methods: [],  // which class
    classes: [],  // which module
    modules: [],
    global_module: null,
    global_variables: [],
    description: "",
    overview: "",
    copyright: "",
    license: "",
    author: "",
    version: ""
  },
  current_module = null,
  current_class = null,
  current_function = null,
  current_method = null;

  function initGlobalModule() {
    var global = {};
    global.name = 'Global';
    global.functions = [];
    global.classes = [];
    result.modules.push(global);
    result.global_module = global;
  }

  if (!raw) {
    return null;
  }
  for (var i = 0; i < raw.length; i++) {
    var comment = raw[i];
    for (var j = 0; j < comment.tags.length; j++) {
      var tag = comment.tags[j];
      switch (tag.tag) {
        case 'license':
          result.license = tag.value;
          result.description = comment.text;
          break;
        case 'author':
          result.author = tag.name;
          result.description = comment.text;
          break;
        case 'copyright':
          result.copyright = tag.value;
          result.description = comment.text;
          break;
        case 'title':
          result.title = tag.value;
          result.description = comment.text;
          break;
        case 'version':
          if (current_function) {
            current_function.version = tag.value;
          } else {
            result.version = tag.value;
            result.description = comment.text;
          }
          break;
        case 'overview':
          result.overview = tag.value;
          result.description = comment.text;
          break;
        case 'param':
          if (current_function) {
            current_function.params.push(tag);
          } else if (current_method) {
            current_method.params.push(tag);
          }
          break;
        case 'function':
          var fn = {};
          fn.name = tag.name;
          fn.params = [];
          fn.returns = '';
          fn.version = '';
          fn.description = comment.text;
          current_function = fn;
          current_method = null;
          if (current_module) {
            current_module.functions.push(fn);
          } else {
            if (!result.global_module) {
              initGlobalModule();
            }
            result.global_module.functions.push(fn);
          }
          result.functions.push(fn);
          break;
        case 'method':
          if (current_class) {
            var method = {};
            method.name = tag.name;
            method.params = [];
            method.returns = '';
            method.version = '';
            method.description = comment.text;
            current_function = null;
            current_method = method;
            current_class.methods.push(method);
          }
          break;
        case 'member':
          if (current_class) {
            current_class.members.push(tag);
          }
          break;
        case 'return':
        case 'returns':
          if (current_function) {
            current_function.returns = tag.text;
            current_function.type = tag.type;
          } else if (current_method) {
            current_method.returns = tag.text;
            current_method.type = tag.type;
          }
          break;
        case 'module':
          var module = {};
          module.name = tag.name;
          module.functions = [];
          module.classes = [];
          module.description = comment.text;
          result.modules.push(module);
          current_module = module;
          break;
        case 'class':
          var klass = {};
          klass.name = tag.name;
          klass.methods = [];
          klass.members = [];
          klass.description = comment.text;
          result.classes.push(klass);
          if (current_module) {
            current_module.classes.push(klass);
          } else {
            if (!result.global_module) {
              initGlobalModule();
            }
            result.global_module.classes.push(klass);
          }
          current_class = klass;
          break;
      }
    }
  }
  return result;
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

function generateEm(text, nl) {
  return '*' + text + '*' + (nl ? '\n\n' : '');
}

function filterMD(text) {
  return text.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

function generateFunctionsForModule(module, displayName) {
  function generateFunction(prefix, fn) {
    var proto = prefix;
    proto += fn.name + '(';
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
    if (fn.params.length) {
      out += generateStrong('Parameters', true);
      for (var k = 0; k < fn.params.length; k++) {
        var param = fn.params[k];
        out += generateStrong(param.name);
        if (param.type) {
          out += ':  ' + generateEm(param.type);
        }
        out += ',  ' + generateText(param.value, true);
      }
    }
    if (fn.returns) {
      out += generateStrong("Returns", true);
      if (fn.type) {
        out += generateEm(fn.type) + ',  ';
      }
      out += generateText(fn.returns, true);
    }
  }

  var out = '';
  if (displayName) {
    out += generateH1('module ' + module.name);
  }
  if (module.description) {
    out += generateText(module.description);
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
//   global_variables: [],
//   description: 'Some extra text\nSome more extra text',
//   overview: 'This is the overview',
//   copyright: '2012 Blah Blah Blah',
//   license: 'MIT',
//   author: 'Joe Schmo',
//   version: '' }

function generateMD(data) {
  if (!data) {
    return "no data to generate from";
  }
  var out = '';
  if (data.title) {
    out += generateH1(data.title);
  }

  if (data.author) {
    // out += 'Author: ' + generateStrong(data.author, true);
    out += generateStrong('Author:') + ' ' + generateText(data.author, true);
  }

  if (data.overview) {
    out += /*generateStrong('Overview:') +' ' +*/ generateText(data.overview, true);
  }

  if (data.description) {
    out += generateText(data.description, true);
  }

  for (var i = 0; i < data.modules.length; i++) {
    out += generateFunctionsForModule(data.modules[i], (data.modules.length > 1));
  }

  //out+='\n\n';

  out += generateLine();

  if (data.copyright) {
    //out += generateEm(/*'©' +*/ data.copyright, true);
  }

  if (data.license) {
    out += generateStrong('License:') +' ' + generateEm(data.license, true);
  }

  return out;
}

function generateForDir(filename, destination, cb) {
  var waiting = 0;
  var error = null;

  function oneFile(directory, file, cb) {
    var fullpath = path.join(destination, file);
    fullpath = fullpath.replace(/\.js$/, '.md');
    if (argv.debug) {
      console.log("Generating", fullpath);
    }
    waiting++;
    parseFile(path.join(directory, file), function(err, result) {
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

      var output = generateMD(analyze(result));
      if (output) {
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
              oneFile(filename, file, cb);
            }
          });
        });
      }
    });
  }
}

function jsdox() {
  fs.mkdir(argv.output, function(err) {
    generateForDir(argv._[0], argv.output, function(err) {
      if (err) {
        console.error(err);
      // } else {
      //   console.log("jsdox completed");
      }
    });
  });
}

exports.isDocComment = isDocComment;
exports.hasTag = hasTag;
exports.parseLine = parseLine;
exports.parseComment = parseComment;
exports.parseComments = parseComments;
exports.parseFile = parseFile;
exports.analyze = analyze;
exports.generateMD = generateMD;
exports.generateForDir = generateForDir;
exports.jsdox = jsdox;

if (require.main === module) {
  jsdox();
}
