var
  util = require("util"),
  assert = require('assert'),
  should = require('should'),
  jsdox = require("../lib/jsdox");

describe('Parsers', function() {

  it('should detect a jsdoc comment', function() {
    jsdox.isDocComment("* 1234").should.be.ok;
  });

  it('should ignore non jsdoc comments', function() {
    jsdox.isDocComment("1234").should.not.be.ok;
    jsdox.isDocComment("** 1234").should.not.be.ok;
  });

  it('should find a tag when there is one', function() {
    jsdox.hasTag("* @param {type} name comment").should.equal("param");
    jsdox.hasTag("@param {type} name comment").should.equal("param");
  });

  it('should not find tag', function() {
    should.not.exist(jsdox.hasTag("param {type} name comment"));
  });

});

describe('parseComment', function() {

  it('should not return anything when not jsdoc', function() {
    var result = jsdox.parseComment("123423 not jsdoc\n** more text", 0, function(text) {
      return "description";
    });
    should.not.exist(result);
  });

  it('should gather all text without tags', function() {
    var result = jsdox.parseComment("*\n123423 not jsdoc\n** more text", 0, function(text) {
      return "description";
    });
    result.text.should.equal('description\ndescription\ndescription');
    result.tags.length.should.be.equal(0);
  });

  it('should only gather all text without tags', function() {
    var result = jsdox.parseComment("*\n123423 not jsdoc\n@copyright blah\n** more text", 0, function(text) {
      return jsdox.hasTag(text) ? {} : 'description';
    });
    result.text.should.equal('description\ndescription\ndescription');
    result.tags.length.should.be.equal(1);
  });


  it('should gather all tags in result.tags[]', function() {
    var result = jsdox.parseComment("*\n123423 not jsdoc\n** more text", 0, function(text) {
      return {tag: 1};
    });
    result.text.should.equal('');
    result.tags.length.should.be.equal(3);
    result.tags[0].tag.should.be.equal(1);
  });


  describe('parseLine', function() {
    it('should return lines without tags without leading * or spaces', function() {
      jsdox.parseLine('*** abcd * ').should.equal('abcd *');
      jsdox.parseLine('   ***    abcd * ').should.equal('abcd *');
      jsdox.parseLine('    abcd').should.equal('abcd');
      jsdox.parseLine('abcd').should.equal('abcd');
    });
    
    it('should compute tagValue', function() {
      jsdox.parseLine('** @param this is the value  ').tagValue.should.equal('this is the value');
    });
    
    it('should parse Text tag', function() {
      var result = jsdox.parseLine('** @copyright this is the value  ');
      result.tag.should.equal('copyright');
      result.value.should.equal('this is the value');
      should.not.exist(result.name);
      should.not.exist(result.type);
    });
    
    it('should parse Name tag', function() {
      var result = jsdox.parseLine('** @class name  ');
      result.tag.should.equal('class');
      result.name.should.equal('name');
      should.not.exist(result.value);
      should.not.exist(result.type);
    });
    
    it('should parse Value tag', function() {
      var result = jsdox.parseLine('** @default value  ');
      result.tag.should.equal('default');
      result.value.should.equal('value');
      should.not.exist(result.name);
      should.not.exist(result.type);
    });

    it('should parse Nothing tag', function() {
      var result = jsdox.parseLine('** @deprecated  ');
      result.tag.should.equal('deprecated');
      should.not.exist(result.value);
      should.not.exist(result.name);
      should.not.exist(result.type);
    });

    it('should parse Type tag', function() {
      var result = jsdox.parseLine('** @type  {the_type}  ');
      result.tag.should.equal('type');
      result.type.should.equal('the_type');
      should.not.exist(result.value);
      should.not.exist(result.name);
    });
    
    it('should parse List tag', function() {
      var result = jsdox.parseLine('** @requires  a, b, c  ');
      result.tag.should.equal('requires');
      result.value.length.should.equal(3);
      result.value[0].should.equal('a');
      result.value[1].should.equal('b');
      result.value[2].should.equal('c');
      should.not.exist(result.type);
      should.not.exist(result.name);
    });
    
    it('should parse TypeName tag without type or comment', function() {
      var result = jsdox.parseLine('** @param  name  ');
      result.tag.should.equal('param');
      result.name.should.equal('name');
      should.not.exist(result.type);
      should.not.exist(result.value);
    });
    
    it('should parse TypeName tag without type but with comment', function() {
      var result = jsdox.parseLine('** @param  name  a comment');
      result.tag.should.equal('param');
      result.name.should.equal('name');
      result.value.should.equal('a comment');
      should.not.exist(result.type);
    });
    
    it('should parse TypeName tag with type and comment', function() {
      var result = jsdox.parseLine('** @param  {type}  name  a comment ');
      result.tag.should.equal('param');
      result.name.should.equal('name');
      result.value.should.equal('a comment');
      result.type.should.equal('type');
    });

    it('should parse multiple lines 1', function() {
      var result = jsdox.parseComment(
        '*\n' +
        'General description here\n' +
        ' * @overview This is the overview\n' +
        ' * @copyright 2012 Blah Blah Blah\n' +
        '\n',
        0,
        jsdox.parseLine);
      assert.deepEqual(result, {
        text: 'General description here\n\n',
        tags: 
          [{
            tag: 'overview',
            tagValue: 'This is the overview',
            value: 'This is the overview'
          }, {
            tag: 'copyright',
            tagValue: '2012 Blah Blah Blah',
            value: '2012 Blah Blah Blah'
          }]
      });
      
    });
    
    it('should parse multiple lines 1', function() {
      var result = jsdox.parseComment(
        '*\n' +
        '  This is a test function\n' +
        '  with a description on multiple lines\n' +
        '  @param {String} file filename to parse\n' +
        '\n',
        0,
        jsdox.parseLine);
      assert.deepEqual(result, {
        text: 'This is a test function\nwith a description on multiple lines\n\n',
        tags: 
          [{
            tag: 'param',
            tagValue: '{String} file filename to parse',
            type: 'String',
            name: 'file',
            value: 'filename to parse'
          }]
      });
      
    });
    
  });


});
