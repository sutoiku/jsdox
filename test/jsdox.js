var exec = require('child_process').exec,
    expect = require('expect.js');

var bin = 'bin/jsdox';

describe('jsdox', function() {
  it('prints an error if an input file or directory is not supplied', function(done) {
    expectOutputFromCommand(bin, 'Error', done, true);
  });

  describe('cli options', function() {
    it('prints the help menu with the -H option', function(done) {
      expectOutputFromCommand(bin + ' -H', 'Usage:', done);
    });

    it('prints the version with the -v option', function(done) {
      expectOutputFromCommand(bin + ' -v', require('../package.json').version, done);
    });
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