var util = require('util');
var fs = require('fs');
var jsp = require("../UglifyJS/uglify-js").parser


/**
  This is a test function
  @param {String} file filename to parse
*/
function test (file) {
  fs.readFile(file, function (err, data) {
    if (err) throw err;
    var ast = jsp.parse(data.toString());
    console.log(util.inspect(ast, false, 20, true));
    /* term */
    // console.log(util.inspect(ast[1][0][1]));
    // console.log(util.inspect(ast[1][3][1]));
    console.log(util.inspect(ast[1][5][1]));
  });
}

test('test.js');