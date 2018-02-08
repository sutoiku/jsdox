var expect = require('expect.js');
var sinon = require('sinon');
var analyze = require('../../lib/analyze');
var jsdoc = require('jsdoc3-parser');
var path = require("path");
require("should");


describe('analyze', function() {
  var test2, test3, test4, test5, test6, test7, test8, fixtures;
  // let's get ASTs for all the test fixtures
  // TODO: use a standardized stub jsdoc AST instead
  before(function(done) {
    jsdoc(path.join(__dirname, "../../fixtures/test2.js"), (err, res) => {
      expect(err).to.eql(null);
      test2 = analyze(res, {}); 
      done();
    });
  });

  before(function(done) {
    jsdoc(path.join(__dirname, "../../fixtures/test3.js"), (err, res) => {
      expect(err).to.eql(null);
      test3 = analyze(res, {}); 
      done();
    });
  });

  before(function(done) {
    jsdoc(path.join(__dirname, "../../fixtures/test4.js"), (err, res) => {
      expect(err).to.eql(null);
      test4 = analyze(res, {}); 
      done();
    });
  });

  before(function(done) {
    jsdoc(path.join(__dirname, "../../fixtures/test5.js"), (err, res) => {
      expect(err).to.eql(null);
      test5 = analyze(res, {}); 
      done();
    });
  });

  before(function(done) {
    jsdoc(path.join(__dirname, "../../fixtures/test6.js"), (err, res) => {
      expect(err).to.eql(null);
      test6 = analyze(res, {}); 
      done();
    });
  });

  before(function(done) {
    jsdoc(path.join(__dirname, "../../fixtures/test7.js"), (err, res) => {
      expect(err).to.eql(null);
      test7 = analyze(res, {}); 
      done();
    });
  });

  before(function(done) {
    jsdoc(path.join(__dirname, "../../fixtures/test8.js"), (err, res) => {
      expect(err).to.eql(null);
      test8 = analyze(res, {}); 
      done();
    });
  });

  it('takes a JSDoc ast and returns a transformed AST', function() {
    const fixtures = [test2, test3, test4, test5, test6, test7, test8];
    fixtures.forEach(fixture => {
      // mandatory (?) fields
      fixture.should.be.an.Object().with.keys(
        "functions",
        "methods",
        "classes",
        "modules",
        "members",
        "globalModule",
        "description",
        "overview",
        "copyright",
        "license",
        "author",
        "hasMembers",
        "version"
      );
    });
  });

  describe('aggregation', () => {
    it('groups all functions', () => {
      const fixtures = [test2, test3, test4, test5, test6, test7, test8];
      const expected = [4,     2,     1,     1,     5,     0,     1];
      fixtures.map(fixture => fixture.functions.length).should.eql(expected);
    });
    it('groups all methods', () => {
      const fixtures = [test2, test3, test4, test5, test6, test7, test8];
      const expected = [0,     0,     0,     0,     0,     0,     0];
      fixtures.map(fixture => fixture.methods.length).should.eql(expected);
    });
    it('groups all classes', () => {
      const fixtures = [test2, test3, test4, test5, test6, test7, test8];
      const expected = [0,     0,     0,     0,     2,     1,     0];
      fixtures.map(fixture => fixture.classes.length).should.eql(expected);
    });
    it('groups all private members', () => {
      const fixtures = [test2, test3, test4, test5, test6, test7, test8];
      const expected = [0,     0,     0,     3,     0,     0,     0];
      fixtures.map(fixture => fixture.members.length).should.eql(expected);
    });
  });

  describe('Supported JSDoc tags', () => {
    describe('file-level tags', () => {
      /* global xit */
      xit('captures @description', () => {
        // TODO: file level descriptions in block should be captured
      });
      it('captures @overview', () => {
        const fixtures = [test2, test3, test4, test5, test6, test7, test8];
        const expected = [
          "This is the overview with some `markdown` included, how nice!",
          "This is the overview with some `markdown` included, how nice!",
          "This is the overview with some `markdown` included, how nice!",
          "This sample will output module requires and members.",
          "This sample handles namespaces, interfaces, and links.",
          "Test classes without methods.",
          ""
        ];
        fixtures.map(fixture => fixture.overview).should.eql(expected);
      });
      it('captures @license', () => {
        const fixtures = [test2, test3, test4, test5, test6, test7, test8];
        const expected = [
          "MIT",
          "MIT",
          "MIT",
          "MIT",
          "MIT",
          "MIT",
          ""
        ];
        fixtures.map(fixture => fixture.license).should.eql(expected);
      });
      it('captures @author', () => {
        const fixtures = [test2, test3, test4, test5, test6, test7, test8];
        const expected = [
          ["Joe Schmo"],
          ["Joe Schmo"],
          ["Joe Schmo"],
          ["lemori"],
          undefined,
          ["Gabor Sar"],
          '' // TODO: check if this should happen
        ];
        fixtures.map(fixture => fixture.author).should.deepEqual(expected);
      });
      it('captures @copyright', () => {
        const fixtures = [test2, test3, test4, test5, test6, test7, test8];
        const expected = [
          "(c) 2012 Blah Blah Blah",
          "(c) 2012 Blah Blah Blah",
          "(c) 2012 Blah Blah Blah",
          undefined,
          undefined,
          undefined,
          '' // TODO: check if this should happen
        ];
        fixtures.map(fixture => fixture.copyright).should.deepEqual(expected);
      });
      xit('captures @namespace', () => {
        console.log(test6);
        test6.namespace.should.eql("main");
      });
    }); // end file-level tags
    describe('object-level tags', () => {
      it('captures @description', () => {
        const funcs = test2.functions;
        const expected = [
          undefined,
          undefined,
          "exported with dot notation",
          "global function"
        ];
        funcs.map(func => func.description).should.eql(expected);
      });
      it('captures @param on functions', () => {
        const params = test2.functions[0].params;
        const expected = [
          {
            name:"a", 
            nested:false,
            description:"the first param",
            type:{names:["String"]},
            typesString:"String"
          },
          {
            name:"b", 
            description:"the second param",
            nested:false,
            type:{names:["String"]},
            typesString:"String"
          }
        ];
        params.should.deepEqual(expected);
      });
      it('captures @returns on functions', () => {
        const returns = test2.functions[0].returns;
        const expected = [{
          description:"the result",
          type:{names:["String"]},
          typesString:"String"
        }];
        returns.should.deepEqual(expected);
      });
    }); // end object-level tags
    describe('module-level tags', () => {
      it('captures @namespace', () => {
        test6.modules.map(module => module.name).should.eql([
          "main",
          "util" // TODO: probably should be main.util
        ]);
      });
      it('captures classes', () => {
        // TODO: test3 should have a defined class with methods and members
        test6.classes.map(klass => klass.name).should.eql([
          "Thing",
          "Worker"
        ]);
      });
    });
    describe('Constructor-style class-level tags', () => {
      var module3, class7;
      before(() => {
        module3 = test3.modules[0];
        class7 = test7.classes[0];
        // TODO: test3 should have a defined class with methods and members
      });
      it('captures @members', () => {
        class7.members.map(member => member.name).should.eql([
          "a",
          "b"
        ]);
      });
      it('captures @methods as functions', () => {
        module3.functions.length.should.eql(2);
        module3.functions.map(func => func.description).should.eql([
          "Create a record",
          "Remove a record"
        ]);
      });
      it('identifies membership of methods', () => {
        module3.functions.map(func => func.memberof).should.eql([
          undefined, // TODO: this is definitely broken
          "Object"
        ]);
      });
      it('captures constructor tags', () => {
        class7.description.should.eql("Test class.");
        class7.name.should.eql("Test");
        class7.params.map(param => param.name).should.eql([
          "a",
          "b"
        ]);
      });
    }); // end constructor-style class tags
    describe('ES6 Class class-level tags', () => {
      xit('captures @members');
      xit('captures @methods as functions');
      xit('identifies membership of methods');
      xit('captures constructor tags');
    });
  }); // end supported jsdoc tags
});
