/**
 * Transforms the AST into a form that represents a single file with modules and their functions.
 *
 * @param {Object} ast
 * @returns {Object}
 *
 * @example
 * { functions:
 *    [ { name: 'testNamed',
 *        params: [ { name: 'file', type: 'String', value: 'filename to parse' } ],
 *        returns: '',
 *        version: '',
 *        description: 'This is a test function\nwith a description on multiple lines' },
 *      { name: 'testAnonynous',
 *        params: [],
 *        returns: 'the result',
 *        version: '',
 *        description: 'function without name',
 *        type: 'String' } ],
 *   methods: [],
 *   classes: [],
 *   modules:
 *    [ { name: 'test_module',
 *        functions:
 *         [ { name: 'testAnonynous',
 *             params: [],
 *             returns: 'the result',
 *             version: '',
 *             description: 'function without name',
 *             type: 'String' } ],
 *        classes: [],
 *        description: '' } ],
 *   global_functions:
 *    [ { name: 'testNamed',
 *        params: [ { name: 'file', type: 'String', value: 'filename to parse' } ],
 *        returns: '',
 *        version: '',
 *        description: 'This is a test function\nwith a description on multiple lines' } ],
 *   description: 'Some extra text\nSome more extra text',
 *   overview: 'This is the overview',
 *   copyright: '2012 Blah Blah Blah',
 *   license: 'MIT',
 *   author: 'Joe Schmo',
 *   version: ''
 * }
 */
module.exports = function(ast) {
  var result = {
    functions: [],
    methods: [],
    classes: [],
    modules: [],
    members: [],
    globalModule: null,
    description: '',
    overview: '',
    copyright: '',
    license: '',
    author: '',
    version: '',
    hasMembers: false
  },
  currentModule   = null,
  currentClass    = null,
  currentFunction = null;

  function initGlobalModule() {
    var global = {};
    global.name      = 'Global';
    global.functions = [];
    global.classes   = [];

    result.modules.push(global);
    result.globalModule = global;
  }

  if (!ast) {
    return null;
  }

  ast.forEach(function (tag) {
    switch (tag.kind) {
      case 'file':
        result.license   = tag.license;
        result.author    = tag.author;
        result.copyright = tag.copyright;
        result.overview  = tag.description;

        (currentFunction || result).version = tag.version;
        (currentFunction || result).deprecated = tag.deprecated || true;
        break;
      case 'function':
        if (tag.undocumented) { break; }

        var fn = tag;
        fn.params       = tag.params || [];
        fn.hasParams    = !!fn.params.length;
        // For the function signature
        fn.paramsString = fn.params.map(function(p) {
          return p.name;
        }).join(', ');

        // For param details
        fn.params.forEach(setPipedTypesString);
        fn.returns      = tag.returns || [];
        fn.returns.forEach(setPipedTypesString);
        // To avoid reaching to the parent for these fields
        fn.version      = tag.version || false;
        fn.fires        = tag.fires || [];
        fn.description  = tag.description;
        fn.deprecated   = tag.deprecated || false;
        fn.internal     = isInternal(fn.name);
        fn.moduleName   = currentModule ? currentModule.name : '';
        currentFunction = fn;
        if (currentClass) {
          currentClass.methods.push(fn);
          fn.className = currentClass ? currentClass.name : '';
        }
        else if (currentModule) {
          currentModule.functions.push(fn);
        } else {
          if (!result.globalModule) {
            initGlobalModule();
          }
          result.globalModule.functions.push(fn);
        }
        result.functions.push(fn);
        break;
      case 'emits':
      case 'fires':
        fn.fires.push(tag.name);
        break;
      case 'member':
        if (currentClass && tag.undocumented !== true) {
          currentClass.members.push(tag);
        } else if (tag.scope === 'inner' && tag.undocumented !== true) {
          result.members.push({member: tag.name});
          result.hasMembers = true;
        }
        break;
      case 'return':
      case 'returns':
        if (currentFunction) {
          currentFunction.returns = tag.text;
          currentFunction.type = tag.type;
        }
        break;
      case 'module':
        var module = {};
        module.name = tag.name;
        module.functions = [];
        module.classes = [];
        module.description = tag.description;
        module.requires = tag.requires || [];
        module.hasRequires = !!module.requires.length;
        module.requires.forEach(function(r, i) {
          if (!r) { return ''; }
          module.requires[i] = {req: r};
        });
        result.modules.push(module);
        currentModule = module;
        break;
      case 'class':
        var klass = {};
        klass.name = tag.name;
        klass.methods = [];
        klass.members = [];
        klass.description = tag.description;
        result.classes.push(klass);
        if (currentModule) {
          currentModule.classes.push(klass);
        } else {
          if (!result.globalModule) {
            initGlobalModule();
          }
          result.globalModule.classes.push(klass);
        }
        currentClass = klass;
        break;
    }
  });

  return result;
}

/**
 * Attaches a 'typesString' pipe-separated attribute
 * containing the node's types
 * @param {AST} node - May or may not contain a type attribute
 */
function setPipedTypesString(node) {
  if (! node.type) { return ''; }

  node.typesString = node.type.names.join(' | ');
}

function isInternal(name){
  return name.lastIndexOf('_', 0) === 0;
}
