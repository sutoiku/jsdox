/**
 * Some extra text
 * @overview What's up?
 * @copyright (c) 2012 Blah Blah Blah
 * @license MIT
 * @author Joe Schmo
 * @version  1.0.1
*/

var util = require('util');
var fs = require('fs');
var jsp = require("uglify-js").parser;

/**
 * Collection of stuff
 * @type {Object}
 */
var foo = {
  /**
   * I so cool
   * @return {Boolean|null}
   * @deprecated Not a good function
   */
  bar: function() {
    return true
  }
}

/**
  This is a test function
  with a description on multiple lines
  @param {String|null} file filename to parse
                       this parsing thing is funny business
  @param {Boolean|null} [optional] Changes behavior
  @fires module:foo#one_thing
  @fires module:foo#another
  @emits module:foo#booyah
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
  Can I get some description please
  on more than one line, if possible.
  @module foo
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

/** 
  * This is a class
  * @class SampleClass
*/
function SampleClass(parm1){

  /**
   * A method in the class
   * @param a the first param
   * @param b the second param
   * @returns the result
  */
  this.func1 = function(a, b) {
    return 1;
  };

  /**
  function without name
    @function testAnonynous
    @returns {String} the result
  */

  var testAnonynous = function() {
    return null;
  };

  /**
    This is a test method
    with a description on multiple lines
    @param {String|null} file filename to parse
                         this parsing thing is funny business
    @param {Boolean|null} [optional] Changes behavior
    @fires module:foo#one_thing
    @fires module:foo#another
    @emits module:foo#booyah
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
}