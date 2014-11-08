/**
 * Aggregates functions and classes for an index page
 * @param  {Object} data - Analyzed ast
 * @return {Object} Index data
 */
module.exports = function(data) {
  var index = {
    classes: [],
    functions: []
  };

  data.functions.forEach(function(toAddFct) {
    if (toAddFct.className === undefined) {
      toAddFct.file = path.relative(destination, fullpath);
      toAddFct.sourcePath = path.relative(destination, path.join(directory, path.basename(file)));
      index.functions.push(toAddFct);
    }
  });

  data.classes.forEach(function(toAddClass) {
    if (toAddClass.className === undefined) {
      toAddClass.file = path.relative(destination, fullpath);
      toAddClass.sourcePath = path.relative(destination, path.join(directory, path.basename(file)));
      index.classes.push(toAddClass);
    }
  });

  return index;
};
