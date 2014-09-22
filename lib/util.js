/**
 * Copyright (c) 2012-2014 Sutoiku
 */

var fs = require('fs');
var util = require('util');
var path = require('path');

/**
 * Recursive readdirSync
 * @param  {String} dir
 * @param  {String[]} filelist
 * @return {String[]}
 */
module.exports.readdirSyncRec = function(dir, filelist) {
  var files = fs.readdirSync(dir);
  var self = this;

  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = self.readdirSyncRec(path.join(dir, file), filelist);
    } else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

/**
 * Pretty print utility
 *
 * @param  {Object} ast [description]
 * @return {String}
 */
module.exports.inspect = function(ast) {
  return util.inspect(ast, false, 20);
};

/**
 * Shallow copy
 * @param  {Object} obj1
 * @param  {Object} obj2
 */
module.exports.extend = function(obj1, obj2) {
  Object.keys(obj2).forEach(function(prop) {
    obj1[prop] = obj2[prop];
  });
};

/**
 * Whether or not the given path represents a directory name
 * The directory name does not have to be of a directory on the filesystem
 * @param  {String}  path
 * @return {Boolean}
 */
module.exports.isDirectoryPath = function(path) {
  return path.dirname(path) === path;
};

/**
 * Whether or not the given resource is a directory on the filesystem
 * @param  {String}  path
 * @return {Boolean}
 */
module.exports.isDirectory = function(path) {
  return fs.lstatSync(path).isDirectory();
};