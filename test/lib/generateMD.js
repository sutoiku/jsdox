var expect = require('expect.js');
var sinon = require('sinon');
var generateMD = require('../../lib/generateMD');
var Mustache = require('mustache');
var fs = require('fs');

describe('generateMD', function() {
  // In case we need to restore earlier
  function restore() {
    if (fs.readFileSync.restore) { fs.readFileSync.restore(); }
    if (Mustache.render.restore) { Mustache.render.restore(); }
  }

  beforeEach(function() {
    sinon.stub(fs, 'readFileSync');
    sinon.stub(Mustache, 'render');
  });

  afterEach(function() {
    restore();
  });

  it('accepts a custom template directory', function() {
    var custom = '../template';
    generateMD([], custom);
    expect(fs.readFileSync.args[0][0].indexOf(custom) !== -1).to.be(true);
  });

  it('defaults to the library\'s template directory if a custom one is not supplied', function() {
    generateMD([]);
    expect(fs.readFileSync.args[0][0].indexOf('templates') !== -1).to.be(true);
  });

  it('renders a given ast with Mustache', function() {
    generateMD([]);
    expect(Mustache.render.called).to.be(true);
  });

  it('returns a string representing the generated markdown for a given ast', function() {
    restore();

    var analyzed = {
      functions: [],
      methods: [],
      classes: [],
      modules: [],
      members: [],
      globalModule: null,
      globalVariables: [],
      description: '',
      overview: 'What\'s up?',
      copyright: '(c) 2012 Blah Blah Blah',
      license: 'MIT',
      author: ['Joe Schmo'],
      version: '1.0.1',
      hasMembers: false,
      deprecated: true
    };

    expect(typeof generateMD(analyzed)).to.be('string');
  });

  it('throws an error if an ast is not supplied', function() {
    expect(generateMD).to.throwError();
  });

  it('sorts index classes and functions by name', function() {
    var analyzed = {
      functions: [
        {name: 'zero', longname: 'zero' },
        {name: 'one', longname: 'foo.one' },
        {name: 'two', longname: 'bar.two' },
        {name: 'three', longname: 'bar.three' },
        {name: 'four', longname: 'foo.four' }
      ],
      classes: [
        {name: 'Five', longname: 'Five' },
        {name: 'Six', longname: 'bar.Six' }
      ]
    };

    generateMD(analyzed, null, true, 'standard');

    expect(analyzed.functions).to.eql([
        {name: 'four', longname: 'foo.four' },
        {name: 'one', longname: 'foo.one' },
        {name: 'three', longname: 'bar.three' },
        {name: 'two', longname: 'bar.two' },
        {name: 'zero', longname: 'zero' }
    ]);
    expect(analyzed.classes).to.eql([
        {name: 'Five', longname: 'Five' },
        {name: 'Six', longname: 'bar.Six' }
    ]);
  });

  it('sorts index classes and functions by namespace', function() {
    var analyzed = {
      functions: [
        {name: 'zero', longname: 'zero' },
        {name: 'one', longname: 'foo.one' },
        {name: 'two', longname: 'bar.two' },
        {name: 'three', longname: 'bar.three' },
        {name: 'four', longname: 'foo.four' }
      ],
      classes: [
        {name: 'Five', longname: 'Five' },
        {name: 'Six', longname: 'bar.Six' }
      ]
    };

    generateMD(analyzed, null, true, 'namespace');

    expect(analyzed.functions).to.eql([
        {name: 'zero', longname: 'zero' },
        {name: 'three', longname: 'bar.three' },
        {name: 'two', longname: 'bar.two' },
        {name: 'four', longname: 'foo.four' },
        {name: 'one', longname: 'foo.one' }
    ]);
    expect(analyzed.classes).to.eql([
        {name: 'Five', longname: 'Five' },
        {name: 'Six', longname: 'bar.Six' }
    ]);
  });

  it('leaves index classes and functions unsorted', function() {
    var analyzed = {
      functions: [
        {name: 'zero', longname: 'zero' },
        {name: 'one', longname: 'foo.one' },
        {name: 'two', longname: 'bar.two' },
        {name: 'three', longname: 'bar.three' },
        {name: 'four', longname: 'foo.four' }
      ],
      classes: [
        {name: 'Five', longname: 'Five' },
        {name: 'Six', longname: 'bar.Six' }
      ]
    };

    generateMD(analyzed, null, true, 'none');

    expect(analyzed.functions).to.eql([
        {name: 'zero', longname: 'zero' },
        {name: 'one', longname: 'foo.one' },
        {name: 'two', longname: 'bar.two' },
        {name: 'three', longname: 'bar.three' },
        {name: 'four', longname: 'foo.four' }
    ]);
    expect(analyzed.classes).to.eql([
        {name: 'Five', longname: 'Five' },
        {name: 'Six', longname: 'bar.Six' }
    ]);
  });
});
