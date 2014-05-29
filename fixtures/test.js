/**
 * Some extra text
 * @title Some smart title goes here
 * @overview This is the overview with some `markdown` included, how nice!
 * @copyright (c) 2012 Blah Blah Blah
 * @license MIT
 * @author Joe Schmo
 * Some more extra text
 *
 * some text after a blank line
*/

var util = require('util');
var fs = require('fs');
var jsp = require("uglify-js").parser;



/**
  This is a test function
  with a description on multiple lines
  @param {String} file filename to parse
  @param {Boolean} [optional] Changes behavior
  @fires one_thing
  @fires an_other
*/
function testNamed(file, optional) {
  fs.readFile(file, function (err, data) {
    if (err) {
      throw err;
    }
    var ast = jsp.parse(data.toString());
    console.log(util.inspect(ast, false, 20, true));
    /* term */
    // console.log(util.inspect(ast[1][0][1]));
    // console.log(util.inspect(ast[1][3][1]));
    console.log(util.inspect(ast[1][5][1]));
  });
}

/**
  @module test_module
  Can I get some description please
  
  on more than one line, if possible.
*/


/**
  function without name
  @function testAnonynous
  @returns {String} the result
*/

var
  testAnonynous = function() {
    return null;
  },
  /**
    second function without name
    @returns {String} the result
  */
  testAnon2 = function() { // #TODO
    return 0;
  }
;

var multi = {
  /**
   * @param a the first param
   * @param b the second param
   * @returns the result
  */
  func1: function(a, b) {
    return 1;
  },
  
  /**
   * @param c the first param
   * @param d the second param
   * @returns the other result
  */
  func2: function(c, d) {
    return null;
  }
  
};

/**
  This is a deprecated function.
  @deprecated Because I said so
*/
function testDeprecated() {
}

testNamed('test.js');
