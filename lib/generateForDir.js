var util = require('./util');
var path = require('path');
var fs = require('fs');
var q = require('q');
var dir = require('node-dir');
var mkdirp = require('mkdirp');

var generateForFile = require('./generateForFile');

/**
 * @param  {Object}   options
 * @param  {String}   options.filename
 * @param  {String}   options.destination
 * @param  {String}   options.templateDir
 * @param  {Function} options.fileCb
 * @returns {Promise}
 *
 * @todo: Support options instead of separate params. Be sure to update grunt-jsdox
 */
module.exports = function(options) {
  var deferred = q.defer();

  var filename = options.filename;
  var fileDir = path.dirname(filename);
  var output = options.output;
  var templateDir = options.templateDir;
  var fileCb = options.fileCb;
  var argv = options.argv;

  var self = this;

  // Aggregated index data about the directory
  this.index = {
    classes: [],
    functions: []
  };

  var aggregateIndexData = function(file, data) {
    var index;
    if (argv.index) {
      index = generateIndexData(data);
      self.index.classes = self.index.classes.concat(index.classes);
      self.index.functions = self.index.functions.concat(index.functions);
    }
  }

  // If it's just a file and not a directory
  if (filename.match(/\.js$/)) {
    generateForFile({
      directory: fileDir,
      file: path.basename(filename),
      argv: argv
    })
    .then(aggregateIndexData)
    .then(deferred.resolve.bind(deferred));

  } else {
    dir.readFiles(directory,
    {
      match: /.js$/,
      exclude: /^\./,
    },
    function (err, content, filename, next) {
      next();
    },
    function(err, files) {
      q.all(files.map(function(filename) {
        mkdirp.sync(path.join(output, path.dirname(filename)));

        return generateForFile({
          directory: fileDir,
          file: filename,
          argv: argv,
          templateDir: templateDir
        }).then(aggregateIndexData);
      }))
      .then(deferred.resolve.bind(deferred));
    });
  }

  return deferred.promise;
};

