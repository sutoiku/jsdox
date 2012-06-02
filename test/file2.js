var
  util = require("util"),
  // assert = require('assert'),
  // should = require('should'),
  fs = require('fs'),
  // jsp = require('../../psq-uglify-js/uglify-js').parser,
  uglify = require('../../psq-uglify-js/uglify-js'),
  jsp = uglify.parser,
  ast_walker = uglify.uglify.ast_walker;
  jsdox = require("../lib/jsdox");


// var file = '../ui.stoic/src/library.js';
var file = 'fixtures/test.js';
// var file = 'fixtures/test2.js';

fs.readFile(file, function (err, data) {
  if (err) {
    throw err;
  }
  var ast = jsp.parse(data.toString());
  console.log(util.inspect(ast, false, 20, true));
  
  var
    w = ast_walker(),
    walk = w.walk;
  
  function hasComments(args) {
    if (args.length) {
      var arg = args[args.length-1];
      if (arg && arg.comments_before) {
        return arg.comments_before;
      }
    }
    return null;
  }
  
  function func() {
    // console.log("function:", util.inspect(arguments, false, 20));
  }
  
  function defun() {
    // console.log("defun:", util.inspect(arguments, false, 20));
  }
  
  function v() {
    console.log("var:", util.inspect(arguments, false, 20));
    var comments = hasComments(arguments);
    // if (comments) {
    //   console.log('var comments:', comments);
    // }
    
    for (var i = 0; i < arguments[0].length; i++) {
      console.log("[0][0][0]", util.inspect(arguments[0][i][0], false, 20));
      console.log("[0][0][1]", util.inspect(arguments[0][i][1][0], false, 20));
    }
  }
  
  function obj() {
    // console.log("object:", util.inspect(arguments, false, 20));
    // console.log("[0][0][0]", util.inspect(arguments[0][0][0], false, 20));
    // console.log("[0][0][1]", util.inspect(arguments[0][0][1][0], false, 20));
    // console.log("[0][0].comments_before", util.inspect(arguments[0][0].comments_before, false, 20));
    // console.log("[0][1][0]", util.inspect(arguments[0][1][0], false, 20));
    // console.log("[0][1][1]", util.inspect(arguments[0][1][1][0], false, 20));
    // console.log("[0][1].comments_before", util.inspect(arguments[0][1].comments_before, false, 20));
  }
  
  function name() {
    console.log("name:", util.inspect(arguments, false, 20));
  }
  
  function stat() {
    console.log("stat:", util.inspect(arguments, false, 20));
  }
  
  
  w.with_walkers({
      "name": name,
      "stat": stat,
      "object": obj,
      "var": v,
      "function": func,
      "defun": defun,
    }, function() {
      return walk(ast);
  });
    
  
  
});
