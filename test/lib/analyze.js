var expect = require('expect.js');
var sinon = require('sinon');
var analyze = require('../../lib/analyze');
var jsdoc = require('jsdoc3-parser');

describe('analyze', function() {
  it.skip('takes a JSDoc ast and returns a transformed AST', function() {
    // Get parser for one of the fixtures
    // Generate the AST using jsdoc
    // Pass to analyze
    // expect(typeof analyze(ast)).to.be('object');
  });

  describe('aggregation', function() {
    it.skip('groups all functions');
    it.skip('groups all methods');
    it.skip('groups all classes');
    it.skip('groups all private members');
  });

  describe('Supported JSDoc tags', function() {
    describe('file-level tags', function() {
      it.skip('captures @description', function() {
        // Feed in a snippet to jsdoc to get a simple ast that has the @description tag
        // Pass to analyze
        // expect(analyze(ast).overview).not.to.be(undefined);
      });
      it.skip('captures @overview');
      it.skip('captures @license');
      it.skip('captures @author');
      it.skip('captures @copyright');
    });
  });
});
