/*
Copyright (c) 2012-2015 Sutoiku

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

var util = require('util');
var fs = require('fs');
var path = require('path');
var q = require('q');
var packageJson = require('./package.json');
var jsdocParser = require('jsdoc3-parser');
var analyze = require('./lib/analyze');
var generateMD = require('./lib/generateMD');
var index = {
  classes: [],
  functions: []
};

/**
 * Whether or not to print debug information.
 * Global to this module.
 *
 * @type {Boolean}
 */
var debug = false;

/**
 * Cache of the optimist arguments list
 *
 * @type {Object}
 */
var argv = {};

/**
 * Pretty print utility
 * @param  {Object} ast [description]
 * @return {String}
 */
function inspect(ast) {
  return util.inspect(ast, false, 20);
}

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
 * @param  {String}   filename
 * @param  {String}   destination
 * @param  {String}   templateDir
 * @param  {Function} cb
 * @param  {Function} fileCb
 */
function generateForDir(filename, destination, templateDir, cb, fileCb) {
  var waiting = 0;
  var touched = 0;
  var error = null;

  var readdirSyncRec = function(dir, filelist) {
    var files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = readdirSyncRec(path.join(dir, file), filelist);
      } else {
        filelist.push(path.join(dir, file));
      }
    });
    return filelist;
  };

  function mkdirParentSync(dirPath) {
    try {
      fs.mkdirSync(dirPath);
    } catch(err) {
      if (err) {
        // parent directory not found
        if (err.errno === 34) {
          fs.mkdirSync(path.dirname(dirPath));
          fs.mkdirSync(dirPath);
        } else {
          throw err;
        }
      }
    }
  }

  function oneFile(directory, file, cb) {
    var fullpath;
    if (argv.rr) {
      fullpath = path.join(path.join(destination, path.dirname(file)), path.basename(file));
    } else {
      fullpath = path.join(destination, file);
    }
    fullpath = fullpath.replace(/\.js$/, '.md');

    if (debug) {
      console.log('Generating', fullpath);
    }

    waiting++;

    jsdocParser(path.join(directory, path.basename(file)), function(err, result) {
      if (err) {
        console.error('Error generating docs for file', file, err);
        waiting--;
        if (!waiting) {
          return cb(err);
        } else {
          error = err;
        }
      }

      if (debug) {
        console.log(file + ' AST: ', util.inspect(result, false, 20));
        console.log(file + ' Analyzed: ', util.inspect(analyze(result), false, 20));
      }

      var data = analyze(result, argv);
      var output = generateMD(data, templateDir);

      if (argv.index) {
        for (var i = 0; i < data.functions.length; i++) {
          if (data.functions[i].className === undefined) {
            var toAddFct = data.functions[i];
            toAddFct.file = path.relative(destination, fullpath);
            toAddFct.sourcePath = path.relative(destination, path.join(directory, path.basename(file)));
            index.functions.push(toAddFct);
          }
        }
        for (var j = 0; j < data.classes.length; j++) {
          if (data.functions[j] && data.functions[j].className === undefined) {
            var toAddClass = data.classes[j];
            toAddClass.file = path.relative(destination, fullpath);
            toAddClass.sourcePath = path.relative(destination, path.join(directory, path.basename(file)));
            index.classes.push(toAddClass);
          }
        }
      }

      if (output) {
        fileCb && fileCb(file, data);
        fs.writeFile(fullpath, output, function(err) {
          waiting--;
          if (err) {
            console.error('Error generating docs for file', file, err);
            error = err;
          }
          if (!waiting) {
            return cb(error);
          }
        });

      } else {
        waiting--;
        if (!waiting) {
          return cb(error);
        }
      }
    });
  }

  if (filename.match(/\.js$/)) {
    oneFile(path.dirname(filename), path.basename(filename), cb);

  } else {
    if (argv.recursive || argv.rr) {
      fs.stat(filename, function (err, s) {
        if (!err && s.isDirectory()) {
          var contentList = readdirSyncRec(filename);
          contentList.forEach(function(fileFullPath) {
            if (argv.rr) {
              //create the sub-directories
              try {
                mkdirParentSync(path.join(destination, path.dirname(fileFullPath)));
              } catch(err) {} //lazy way: if the file already exists, everything is alright.
              try {
                oneFile(path.dirname(fileFullPath), fileFullPath, cb), touched++;
              } catch(err) {
                console.error('Error generating docs for files', path.basename(fileFullPath), err);
                return cb(err);
              }
            } else {
              try {
                oneFile(path.dirname(fileFullPath), path.basename(fileFullPath), cb), touched++;
              } catch(err) {
                console.error('Error generating docs for files', path.basename(fileFullPath), err);
                return cb(err);
              }
            }
          });
          if (!touched) {
            cb();
          }

        } else {
          cb();
        }
      });
    } else {
      fs.stat(filename, function (err, s) {
        if (!err && s.isDirectory()) {
          fs.readdir(filename, function (err, files) {
            if (err) {
              console.error('Error generating docs for files', filename, err);
              return cb(err);
            }
            files.forEach(function (file) {
              if (file.match(/\.js$/)) {
                oneFile(filename, file, cb), touched++;
              }
            });
            if (!touched) {
              cb();
            }
          });
        } else {
          cb();
        }
      });
    }
  }
}

/**
 * @param  {String}   file
 * @param  {Function} callback
 */
function loadConfigFile(file, argv, callback) {
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
  if (typeof argv._[0] !== 'undefined') {
    fs.mkdir(argv.output, function() {
      q.all(argv._.map(function(file) {
        var deferred = q.defer();

        generateForDir(file, argv.output, argv.templateDir, function(err) {
          if (err) {
            console.error(err);
            throw err;
          }

          deferred.resolve();
        });

        return deferred.promise;
      }))
        .then(function() {
          //create index
          if (argv.index) {
            var fileName;
            if (argv.index === true) {
              fileName = 'index';
            } else {
              fileName = argv.index;
            }
            if (typeof argv.output === 'string') {
              fileName = path.join(argv.output, fileName);
            } else {
              fileName = path.join('output', fileName);
            }
            fs.writeFileSync(fileName + '.md', generateMD(index, argv.templateDir, true, argv['index-sort']));
          }
        })
        .then(function () {
          console.log('jsdox completed');
        });
    });
  } else {
    console.error('Error missing input file or directory.');
    printHelp();
  }
}

function jsdox(args) {
  argv = args;
  debug = !!argv.debug;

  if (argv.help) {
    printHelp();
  }

  if (argv.version) {
    printVersion();
  }

  if (argv.config) {
    // @todo: refactor to not rely on argv
    loadConfigFile(argv.config, argv, main);
  } else {
    main(argv);
  }
}

exports.analyze = analyze;
exports.generateMD = generateMD;
exports.generateForDir = generateForDir;
exports.jsdox = jsdox;
