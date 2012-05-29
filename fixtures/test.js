/**
 * @overview This is the overview
 * @copyright 2012 Blah Blah Blah
*/

var util = require('util');
var fs = require('fs');
var jsp = require("../UglifyJS/uglify-js").parser;


/**
  This is a test function
  with a description on multiple lines
  @param {String} file filename to parse
*/
function test(file) {
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
  function without name
  @function test2
  @returns null
*/

var test2 = function() {
  return null;
};

test('test.js');