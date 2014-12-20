/**
  @overview This sample handles namespaces and interfaces.
  @license MIT
*/


/**
 * The top-level namespace.
 * @namespace
 */
var main = {};


/**
 * Initializes everything.
 */
main.init = function() {};


/**
 * Disposes everything.
 */
main.dispose = function() {};


/**
 * Definition for a Thing object.
 * @interface
 */
main.Thing;


/**
 * Every Thing has a name.
 * @type {string}
 */
main.Thing.prototype.name;


/**
 * Every Thing might have some data.
 * @type {*|undefined}
 */
main.Thing.prototype.data;


/**
 * Definition for a Worker.
 * @interface
 */
main.Worker;


/**
 * Have a Worker do some Thing.
 *
 * @param {main.Thing} thing The Thing to do.
 */
main.Worker.prototype.do = function(thing) {};


/**
 * Namespace for utility functions.
 * @namespace
 */
main.util = {};


/**
 * Run the Foo utility.
 */
main.util.foo = function() {};


/**
 * Run the Bar utility.
 */
main.util.bar = function() {};
