var path = require('path');
var jsdocParser = require('jsdoc3-parser');
var fs = require('fs');
var q = require('q');

var util = require('./util');
var analyze = require('./analyze');
var generateMD = require('./generateMD');

/**
 * Generates the markdown output for a single JS file
 *
 * @param  {Object} options
 * @param  {String} options.directory
 * @param  {String} options.file
 * @param  {Object} options.argv
 * @param  {String} options.templateDir
 * @return {Promise} Resolves with the file {String} and the analyzed ast {Object}
 */
module.exports = function(options) {
  console.log(options)

  var deferred = q.defer();
  var filename = options.filename;
  var fileDir = path.dirname(filename);
  var fileBase = path.basename(filename);
  var argv = options.argv;
  var outputPath;
  var outputDir;

  // Lazy way to check if it's a directory without
  // hitting the filesystem, in case the output dir doesn't exist yet
  if (path.dirname(argv.output) === argv.output) {
    // Markdown should be in the proper subdirectory of the output dir
    if (argv.recursive) {
      outputPath = path.join(path.join(argv.output, fileDir), fileBase);

    // Just dump the markdown into the output folder
    } else {
      outputPath = path.join(argv.output, fileBase);
    }

  // We're storing the markdown in a separate file
  } else {
    outputPath = argv.output;
  }

  console.log('fullpath: ', outputPath)
  outputPath = outputPath.replace(/\.js$/, '.md');

  if (argv.debug) {
    console.log('Generating', outputPath);
  }

  jsdocParser(filename, function(err, result) {
    if (err) {
      console.error('Error generating docs for file', filename, err);
      deferred.reject(err);
      return;
    }

    if (options.debug) {
      console.log(file + ' AST: ', util.inspect(result));
      console.log(file + ' Analyzed: ', util.inspect(analyze(result)));
    }

    var data = analyze(result, argv);
    var output = generateMD(data, options.templateDir);

    try {
      if (output) {
        fs.writeFileSync(outputPath, output);
      }

      deferred.resolve(filename, data);
      return;

    } catch (err) {
      console.error('Error generating docs for file', filename, err);
      deferred.reject(err);
    }
  });

  return deferred.promise;
};
