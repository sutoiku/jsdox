/**
 * Copyright (c) 2012-2014 Sutoiku
 *
 */

var Mustache = require('mustache');
var fs = require('fs');
var path = require('path');

/**
 * Renders markdown from the given analyzed AST
 * @param  {Object} ast - output from analyze()
 * @param  {String} templateDir - templates directory (optional)
 * @return {String} Markdown output
 */
module.exports = function(ast, templateDir, isIndex, sort) {
  if (!ast) { throw new Error('no analyzed ast to generate markdown from'); }

  var templates;

  if (!templateDir) {
    templateDir = path.resolve(__dirname, '../templates');
  } else {
    templateDir = templateDir.replace(/\\/g, '/');
  }

  //if ast is an index file, we need to sort the contents and to use the right templates;
  if (isIndex) {
    console.log('Now generating index');
    var sortFn;
    if (sort === 'none') {
      sortFn = null;
    } else if (sort === 'namespace') {
      sortFn = function(a, b) {
        var namespaceA = a.longname.split('.').slice(0, -1);
        var namespaceB = b.longname.split('.').slice(0, -1);
        if (namespaceA < namespaceB) {
          return -1;
        }
        if (namespaceA > namespaceB) {
          return 1;
        }
        return a.name < b.name ? -1 : 1;
      };
    } else {
      sortFn = function(a, b) {
        return a.name < b.name ? -1 : 1;
      };
    }
    if (sortFn !== null) {
      ast.classes.sort(sortFn);
      ast.functions.sort(sortFn);
    }

    templates = {
      index: fs.readFileSync(templateDir + '/index.mustache', 'utf8'),
      class: fs.readFileSync(templateDir + '/overview.mustache', 'utf8'),//do we need different overview templates for functions or classes here ?
      function: fs.readFileSync(templateDir + '/overview.mustache', 'utf8')
    };
    return Mustache.render(templates.index, ast, templates);
  }

  templates = {
    file: fs.readFileSync(templateDir + '/file.mustache', 'utf8'),
    class: fs.readFileSync(templateDir + '/class.mustache', 'utf8'),
    function: fs.readFileSync(templateDir + '/function.mustache', 'utf8')
  };
  return Mustache.render(templates.file, ast, templates);
};
