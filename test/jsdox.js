var exec = require('child_process').exec,
    expect = require('expect.js'),
    fs = require('fs');

var bin = 'bin/jsdox';

describe('jsdox', function() {
  it('prints an error if an input file or directory is not supplied', function(done) {
    expectOutputFromCommand(bin, 'Error', done, true);
  });

  it('generates non-empty output markdown files from the fixtures/ files', function(done) {
    var cmd = bin + ' fixtures/**.js -o sample_output';

    exec(cmd, function(err, stdout, stderr) {
      expect(stderr).to.be.empty();

      fs.readdirSync('sample_output').forEach(function(outputFile) {
        var content = fs.readFileSync('sample_output/' + outputFile).toString();
        expect(content).not.to.be.empty();
      });

      done();
    });
  });

  describe('cli options', function() {
    it('prints the help menu with the -H option', function(done) {
      expectOutputFromCommand(bin + ' -H', 'Usage:', done);
    });

    it('prints the version with the -v option', function(done) {
      expectOutputFromCommand(bin + ' -v', require('../package.json').version, done);
    });

    it('accepts a custom template directory with the -t option');
  });
});

/**
 * Helper for asserting that the output from running jsdox from the cli
 * contains a given string
 * @param  {String}   cmd    - The command to execute
 * @param  {String}   output - The string that should be in the output
 * @param  {Function} done   - Executed when the exec is finished
 * @param  {Boolean} isError - Whether or not to check stderr instead
 */
function expectOutputFromCommand(cmd, output, done, isError) {
  exec(cmd, function(err, stdout, stderr) {
    var stream = isError ? stderr : stdout;
    expect(stream.indexOf(output) !== -1).to.be(true);
    done();
  });
}