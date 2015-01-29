/**
 * Copyright (c) 2012-2015 Sutoiku
 *
 */

var Mustache = require('mustache');
var fs = require('fs');
var path = require('path');
var util = require('util');


/**
 * Replaces {@link ...} with `[...](...)`.
 * @param {string} str - string to process
 * @param {Object} targets - map of targets to use for links (optional)
 * @return {string}
 */
function replaceLink(str, targets) {
  return str.replace(/\{@link\s+([^}]+)\}/g, function(full, link) {
    if (link in targets) {
      return util.format('[%s](%s)', link, targets[link]);
    } else if (link.match(/^(https?:)?\/\//)) {
      return util.format('[%s](%s)', link, link);
    }
    return link;
  });
}


/**
 * Processes a tag for Markdown replacements.
 * @param {Object} tag - tag to process
 * @param {Object} targets - map of targets to use for links (optional)
 */
function processTag(tag, targets) {
  if (tag.description) {
    tag.description = replaceLink(tag.description, targets);
  }
  if (tag.params) {
    tag.params.forEach(function (param) {
      if (param.description) {
        param.description = replaceLink(param.description, targets);
      }
    });
  }
  if (tag.members) {
    tag.members.forEach(function (member) {
      processTag(member, targets);
    });
  }
  if (tag.methods) {
    tag.methods.forEach(function (method) {
      processTag(method, targets);
    });
  }
}


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

  var tags = (ast.modules || [])
      .concat(ast.classes || [])
      .concat(ast.functions || []);
  var targets = {};
  tags.forEach(function (tag) {
    if (tag.longname) {
      tag.target = targets[tag.longname] = '#' + tag.longname.toLowerCase();
    }
  });

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

  tags.forEach(function (tag) {
    processTag(tag, targets);
  });

  templates = {
    file: fs.readFileSync(templateDir + '/file.mustache', 'utf8'),
    class: fs.readFileSync(templateDir + '/class.mustache', 'utf8'),
    function: fs.readFileSync(templateDir + '/function.mustache', 'utf8')
  };
  return Mustache.render(templates.file, ast, templates);
};
