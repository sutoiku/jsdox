var
  util = require('util'),
  fs = require('fs'),
  uglify = require('../../psq-uglify-js/uglify-js'),
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

function parseNothing(text, tag, lineNo) {
  if (stripSpaces(text) !== '') {
    console.log(lineNo + ': ' + tag.tag + ' should not have data');
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
    console.log(lineNo + ': type format incorrect (' + trimmed + ')');
  }
  tag.type = trimmed.substr(1, trimmed.length-2);
}

/* 
paramType - Optional: the expected type of the parameter.
paramName - Required: the name of the parameter
paramDescription - Optional: a description associated with the parameter.
*/
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

/* 
paramType - Optional: the expected type of the parameter.
paramName - Required: the name of the parameter
paramDescription - Optional: a description associated with the parameter.
*/
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
      console.log(lineNo + ': Tag not supported: ' + tag);
    }
    return result;
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
          // if (parsed.length > 0) {
            result.text += '\n' + parsed;
          // }
        }
      } else {
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
      return true;
    }
  }
  return false;
}

function parseComments(ast) {
  var
    w = ast_walker(),
    walk = w.walk,
    result = [],
    anonfun = function() {
      // console.log("found: anonfun", arguments.length, util.inspect(arguments, false, 20));
      // TODO: try to get context to find var name or object key holding function (not reliable enough? use @function)
    },
    defun = function() {
      var functionName = arguments[0];
      var fn = {
        text: '',
        generated: true,
        tags: [{
          tag: "function",
          tagValue: functionName,
          name: functionName
        }]
      };
      if (result.length  && !commentHasTag(result[result.length-1], 'function')) {
        result[result.length-1].tags.unshift(fn.tags[0]);
      } else {
        result.push(fn);
      }
      // TODO: capture params?
      // TODO: would it be safe to add top of the stack with this if function is not there?
    },
    rem = function() {
      var comment = arguments[0];
      if (comment.type === 'comment2') {
        var parsed = parseComment(comment.value, comment.line, parseLine);
        if (parsed) {
          result.push(parsed);
        }
      }
    };

  w.with_walkers({
      "function": anonfun,
      "defun": defun,
      "rem": rem
    }, function() {
      return walk(ast);
  });
  return result;
}

function parseFile(file, cb) {
  fs.readFile(file, function (err, data) {
    if (err) {
      return cb(err);
    }
    try {
      var ast = jsp.parse(data.toString());
      var result = parseComments(ast);
    } catch(e) {
      console.log(e);
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
  current_function = null;
  
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
            current_function.params.push({
              name: tag.name,
              type: tag.type,
              value: tag.value
            });
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
          if (current_module) {
            current_module.functions.push(fn);
          } else {
            if (!result.global_module) {
              var global = {};
              global.name = 'Global';
              global.functions = [];
              global.classes = [];
              result.modules.push(global);
              result.global_module = global;
            }
            result.global_module.functions.push(fn);
          }
          result.functions.push(fn);
          break;
        case 'returns':
          if (current_function) {
            current_function.returns = tag.text;
            current_function.type = tag.type;
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
  return text.replace(/\n/g, '\n') + (nl ? '\n\n' : '');
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
  var out = '';
  if (displayName) {
    out += generateH1(module.name);
  }
  if (module.description) {
    out += generateText(module.description);
  }
  
  for (var i = 0; i < module.functions.length; i++) {
    var fn = module.functions[i];
    var proto = fn.name + '(';
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
  var out = '';
  if (data.title) {
    out += generateH1(data.title);
  }
  
  if (data.copyright) {
    out += generateEm('©' + data.copyright, true);
  }
  
  if (data.author) {
    // out += 'Author: ' + generateStrong(data.author, true);
    out += generateStrong('Author:') + ' ' + generateText(data.author, true);
  }
  
  if (data.overview) {
    out += generateStrong('Overview:') +' ' + generateText(data.overview, true);
  }
  
  if (data.description) {
    out += generateText(data.description, true);
  }
  
  for (var i = 0; i < data.modules.length; i++) {
    out += generateFunctionsForModule(data.modules[i], (data.modules.length > 1));
  }

  
  // 
  // out += generateH2("This is H2");
  // out += generateLine();
  // out += generateList(['abc', 'def', 'ghi']);
  // out += generateCode("code") + ' ' +
  //   generateURL('link', 'http://test.com') + ' ' +
  //   generateEm('Em') + ' ' +
  //   generateStrong('Strong') + 
  //   ' normal text\n';
  // out += generateCodeBlock("{\n  code\n}", 'javascript') + '\n';
  
  return out;
}

exports.isDocComment = isDocComment;
exports.hasTag = hasTag;
exports.parseLine = parseLine;
exports.parseComment = parseComment;
exports.parseComments = parseComments;
exports.parseFile = parseFile;
exports.analyze = analyze;
exports.generateMD = generateMD;

// (function() {
//   // console.log(process.argv[2]);
//   parseFile(process.argv[2], function(err, result) {
//     if (err) {
//       return err;
//     }
//     var output = generateMD(analyze(result));
//     console.log(output);
//   });
// })();
