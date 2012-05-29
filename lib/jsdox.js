var
  util = require('util'),
  fs = require('fs'),
  uglify = require('../../psq-uglify-js/uglify-js'),
  jsp = uglify.parser,
  ast_walker = uglify.uglify.ast_walker;

var TAGS = {
  "constructor": parseTypeName,
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
  "returns": parseTypeName,
  "return": parseTypeName,
  "see": parseName,
  "since": parseText,
  "summary": parseText,
  "this": parseName,
  "type": parseType,
  "version": parseText
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
          if (parsed.length > 0) {
            result.text += '\n' + parsed;
          }
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
      result.push({
        text: '',
        generated: true,
        tags: [{
          tag: "function",
          tagValue: functionName,
          name: functionName
        }]
      });
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
    var ast = jsp.parse(data.toString());
    var result = parseComments(ast);
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
    functions: [], // which module, list of params + returns
    methods: [], // which class
    classes: [], // which module
    modules: [],
    globals: [],
    overview: "",
    copyright: "",
    license: "",
    author: ""
  };
  for (var i = 0; i < raw.length; i++) {
    
  }
}

exports.isDocComment = isDocComment;
exports.hasTag = hasTag;
exports.parseLine = parseLine;
exports.parseComment = parseComment;
exports.parseComments = parseComments;
exports.parseFile = parseFile;