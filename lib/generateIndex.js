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
    console.log('generate index now');
    if (!ast) { throw new Error('no analyzed ast to generate markdown from'); }
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

    if (!templateDir) {
        templateDir = path.resolve(__dirname, '../templates');
    } else {
        templateDir = templateDir.replace(/\\/g, '/');
    }

    var templates = {
        index: fs.readFileSync(templateDir + '/index.mustache', 'utf8'),
        class: fs.readFileSync(templateDir + '/overview.mustache', 'utf8'),
        function: fs.readFileSync(templateDir + '/overview.mustache', 'utf8')
    };
    var tmp=Mustache.render(templates.index, ast, templates);


    return tmp;
};