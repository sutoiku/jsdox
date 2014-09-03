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
    it('generates non-empty output markdown files from the fixtures/ and the fixtures/under files', function(done) {
        var cmd =bin + ' fixtures/ -o sample_output -r';
        //in case an old index.md is here
        try{
            fs.unlinkSync('sample_output/index.md');
        }catch(err){}

        exec(cmd, function(err, stdout, stderr) {
            expect(stderr).to.be.empty();

            var nbFiles=0;
            fs.readdirSync('sample_output').forEach(function(outputFile) {
                var content = fs.readFileSync('sample_output/' + outputFile).toString();
                expect(content).not.to.be.empty();
                nbFiles+=1;
            });
            expect(nbFiles).to.be(6);

            done();
        });
    });

    it('generates non-empty output markdown files from the fixtures/ and the fixtures/under files and an under directory in outputs', function(done) {
        var cmd =bin + ' fixtures/ -o sample_output --rr -i';

        exec(cmd, function(err, stdout, stderr) {
            expect(stderr).to.be.empty();

            var nbFilesA=0;
            var nbFilesB=0;
            fs.readdirSync('sample_output/fixtures').forEach(function(outputFile) {
                if(!fs.statSync('sample_output/fixtures/' + outputFile).isDirectory()) {
                    var content = fs.readFileSync('sample_output/fixtures/' + outputFile).toString();
                    expect(content).not.to.be.empty();
                    nbFilesA += 1;
                    //clean for future tests
                    fs.unlinkSync('sample_output/fixtures/' + outputFile);
                }
            });
            expect(nbFilesA).to.be(4);
            fs.readdirSync('sample_output/fixtures/under').forEach(function(outputFile) {
                var content = fs.readFileSync('sample_output/fixtures/under/' + outputFile).toString();
                expect(content).not.to.be.empty();
                nbFilesB+=1;
                fs.unlinkSync('sample_output/fixtures/under/' + outputFile);
            });
            fs.rmdirSync('sample_output/fixtures/under/');
            fs.rmdirSync('sample_output/fixtures/');
            expect(nbFilesB).to.be(2);


            done();
        });
    });

    it('generates non-empty output markdown files from the fixtures/ and the fixtures/under files and index.md', function(done) {
        var cmd =bin + ' fixtures/ -o sample_output -r -i';

        exec(cmd, function(err, stdout, stderr) {
            expect(stderr).to.be.empty();

            var nbFiles=0;
            var hasIndex=false;
            fs.readdirSync('sample_output').forEach(function(outputFile) {
                var content = fs.readFileSync('sample_output/' + outputFile).toString();
                expect(content).not.to.be.empty();
                nbFiles+=1;
                hasIndex=hasIndex||(outputFile === 'index.md');
            });
            expect(nbFiles).to.be(7);
            expect(hasIndex).to.be(true);
            //clean index for other tests
            fs.unlinkSync('sample_output/index.md');

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