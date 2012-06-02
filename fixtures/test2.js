/**
 * Some extra text
 * @title Some smart title goes here
 * @overview This is the overview with some `markdown` included, how nice!
 * @copyright 2012 Blah Blah Blah
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
  
}

testNamed('test.js');