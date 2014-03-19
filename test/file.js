/*jshint -W079*/

var
  util = require("util"),
  assert = require('assert'),
  should = require('should'),
  fs = require('fs'),
  jsp = require('uglify-js').parser,
  jsdox = require("../jsdox");


describe('parse file', function() {

  it('should parse file', function(done) {
    fs.readFile('fixtures/test.js', function (err, data) {
      if (err) {
        return done(err);
      }

      var ast = jsp.parse(data.toString());
      console.log('AST', util.inspect(ast, false, 20, true));
      should.exist(ast);

      var result = jsdox.parseComments(ast);
      console.log('RESULT', util.inspect(result, false, 20, true));
      result.length.should.equal(8);

      result[0].tags[0].tag.should.equal('title');
      result[0].tags[1].tag.should.equal('overview');
      result[0].tags[2].tag.should.equal('copyright');
      result[1].tags[0].tag.should.equal('function');
      result[1].tags[1].tag.should.equal('param');
      result[2].tags[0].tag.should.equal('module');
      result[3].tags[0].tag.should.equal('function');
      result[3].tags[1].tag.should.equal('returns');
      return done();
    });
  });

  it('should parse file directly', function(done) {
    jsdox.parseFile('fixtures/test.js', function(err, result) {
      if (err) {
        return done(err);
      }
      result.length.should.equal(8);
      // same as test above, shouldn't need to retest for same
      return done();
    });
  });

  it('should analyze', function(done) {
    jsdox.parseFile('fixtures/test.js', function(err, result) {
      if (err) {
        return done(err);
      }
      var analyzed = jsdox.analyze(result);
      console.log(util.inspect(analyzed, false, 20));
      return done();
    });
  });

});
