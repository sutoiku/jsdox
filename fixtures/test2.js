/*global exports:true */

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

exports = {
  /**
   * @param a the first param
   * @param b the second param
   * @ returns the result
  */
  func1: function(a, b) {
    return 1;
  },

  /**
   * @param c the first param
   * @param d the second param
   * @ returns the other result
  */
  func2: function(c, d) {
    return null;
  }

};


/**
 * exported with dot notation
 * @param {String} param the parameter
 */
exports.exported = function(param) {
  return 5;
};

/**
 * global function
 * @param {String} param the parameter
 */
var globalFunction = function(param) {
  return 5;
};


exports.func1('test.js');
