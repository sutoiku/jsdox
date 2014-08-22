var expect = require('expect.js'),
    sinon = require('sinon'),
    generateMD = require('../../lib/generateMD'),
    Mustache = require('mustache'),
    fs = require('fs');

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
      author: [ 'Joe Schmo' ],
      version: '1.0.1',
      hasMembers: false,
      deprecated: true
    };

    expect(typeof generateMD(analyzed)).to.be('string');
  });

  it('throws an error if an ast is not supplied', function() {
    expect(generateMD).to.throwError();
  });
});
