var Mustache = require('mustache'),
    fs = require('fs'),
    path = require('path');

/**
 * Renders markdown from the given analyzed AST
 * @param  {Object} ast - output from analyze()
 * @param  {String} templateDir - templates directory (optional)
 * @return {String} Markdown output
 */
module.exports = function(ast, templateDir, isIndex) {
    if (!ast) { throw new Error('no analyzed ast to generate markdown from'); }

    var templates;

    if (!templateDir) {
        templateDir = path.resolve(__dirname, '../templates');
    } else {
        templateDir = templateDir.replace(/\\/g, '/');
    }

    //if ast is an index file, we need to sort the contents and to use the right templates;
    if(isIndex){
        console.log('Now generating index');
        ast.classes.sort(function(a,b){
            if(a.name< b.name){
                return -1;
            }else{
                return 1;
            }
        });
        ast.functions.sort(function(a,b){
            if(a.name< b.name){
                return -1;
            }else{
                return 1;
            }
        });

        templates = {
            index: fs.readFileSync(templateDir + '/index.mustache', 'utf8'),
            class: fs.readFileSync(templateDir + '/overview.mustache', 'utf8'),//do we need different overview templates for functions or classes here ?
            function: fs.readFileSync(templateDir + '/overview.mustache', 'utf8')
        };
        return Mustache.render(templates.index, ast, templates);;
    }else {


        templates = {
            file: fs.readFileSync(templateDir + '/file.mustache', 'utf8'),
            class: fs.readFileSync(templateDir + '/class.mustache', 'utf8'),
            function: fs.readFileSync(templateDir + '/function.mustache', 'utf8')
        };
        return Mustache.render(templates.file, ast, templates);
    }
}