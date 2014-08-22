var Mustache = require('mustache'),
    fs = require('fs'),
    path = require('path');

/**
 * Renders markdown from the given analyzed AST
 * @param  {Object} ast - output from analyze()
 * @param  {String} templateDir - templates directory (optional)
 * @return {String} Markdown output
 */
module.exports = function(ast, templateDir) {
  if (!ast) { throw new Error('no analyzed ast to generate markdown from'); }

  if (!templateDir) {
    templateDir = path.resolve(__dirname, '../templates');
  } else {
    templateDir = templateDir.replace(/\\/g, '/');
  }

  var templates = {
    file: fs.readFileSync(templateDir + '/file.mustache', 'utf8'),
    class: fs.readFileSync(templateDir + '/class.mustache', 'utf8'),
    function: fs.readFileSync(templateDir + '/function.mustache', 'utf8')
  };

  return Mustache.render(templates.file, ast, templates);
}