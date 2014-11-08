/*
Copyright (c) 2012-2014 Sutoiku

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var fs = require('fs');
var path = require('path');
var q = require('q');
var mkdirp = require('mkdirp');

var packageJson = require('./package.json');
var generateForDir = require('./lib/generateForDir');
var generateForFile = require('./lib/generateForFile');
var generateMD = require('./lib/generateMD');
var util = require('./lib/util');

function printHelp() {
  console.log('Usage:\tjsdox [options] <file | directory>');
  console.log('\tjsdox --All --output docs folder\n');
  console.log('Options:');
  console.log('  -c,\t--config \t<file>\t Configuration JSON file.');
  console.log('  -A,\t--All\t\t\t Generates documentation for all available elements including internal methods.');
  console.log('  -d,\t--debug\t\t\t Prints debugging information to the console.');
  console.log('  -H,\t--help\t\t\t Prints this message and quits.');
  console.log('  -v,\t--version\t\t Prints the current version and quits.');
  console.log('  -o,\t--output\t\t Output directory.');
  console.log('  -t,\t--templateDir\t\t Template directory to use instead of built-in ones.');
  console.log('  -i,\t--index\t\t\t Generates an index with the documentation. A file name can be provided in argument.');
  console.log('  -r,\t--recursive\t\t Generates documentation in all subdirectories of the directory given as argument.');
  console.log('  --rr,\t--respect-recursive\t Will generate subdirectories and copy the original organization of the sources.');

  process.exit();
}

function printVersion() {
  console.log('Version: ' + packageJson.version);
  process.exit();
}

/**
 * @param  {Object}   argv
 * @param  {Function} callback
 */
function loadConfigFile(argv, callback) {
  var file = argv.config;
  var config;

  // Check to see if file exists
  file = path.resolve(process.cwd(), file);

  fs.exists(file, function(exists) {
    if (exists) {
      try {
        config = require(file);
      } catch(err) {
        console.error('Error loading config file: ', err);
        process.exit();
      }

      for (var key in config) {
        if (key !== 'input') {
          argv[key] = config[key];
        } else {
          argv._[0] = config[key];
        }
      }
      callback();

    } else {
      console.error('Error loading config file: ', file);
      process.exit();
    }
  });
}

function main(argv) {

  console.log(argv)

  if (!argv._.length) {
    console.error('Error missing input file or directory.');
    printHelp();
    return;
  }

  // @todo: support input being a directory and output being a directory
  // @todo: support input being a file and output being a file

  if (util.isDirectoryPath(argv.output)) {
    try {
      mkdirp.sync(argv.output);
    } catch (err) {}
  }

  q.all(argv._.map(function(filename) {
    var options = {
      filename: filename,
      argv: argv
    };

    return util.isDirectory(filename) ?
            generateForDir(options) :
            generateForFile(options);
  }))
  .then(function() {
    // Create index
    if (argv.index) {
      var fileName = argv.index === true ? 'index' : argv.index;
      fileName = typeof argv.output === 'string' ?
                  path.join(argv.output, fileName) :
                  path.join('output', fileName);

      fs.writeFileSync(fileName + '.md', generateMD(generateForDir.index, argv.templateDir, true));
    }
  })
  .then(function () {
    console.log('jsdox completed');
  });
}

function jsdox(argv) {
  if (argv.help) {
    printHelp();
  }

  if (argv.version) {
    printVersion();
  }

  if (argv.config) {
    loadConfigFile(argv, main);
  } else {
    main(argv);
  }
}

exports.analyze = require('./lib/analyze');
exports.generateMD = require('./lib/generateMD');
exports.generateForDir = require('./lib/generateForDir');
exports.generateForFile = require('./lib/generateForFile');
exports.jsdox = jsdox;
