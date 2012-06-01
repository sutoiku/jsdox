var
  util = require("util"),
  // assert = require('assert'),
  // should = require('should'),
  fs = require('fs'),
  // jsp = require('../../psq-uglify-js/uglify-js').parser,
  jsp = require('../../psq-uglify-js/uglify-js').parser,
  jsdox = require("../lib/jsdox");


fs.readFile('fixtures/test.js', function (err, data) {
  if (err) {
    throw err;
  }
  var ast = jsp.parse(data.toString());
  console.log(util.inspect(ast, false, 20, true));
});
