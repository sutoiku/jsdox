/**
 * Some extra text
 * @title Some smart title goes here
 * @overview This is the overview with some `markdown` included, how nice!
 * @copyright (c) 2012 Blah Blah Blah
 * @license MIT
 * @author Joe Schmo
 * Some more extra text
 *
 * some text after a blank line
 */


/**
 * Create an object object
 * @class  Object
 * @member {Sheet}  datasheet     The object's 'Data' sheet
 * @member {Sheet}  fieldsNumber  The object's number of fields
 * @member {Sheet}  fields        The names of the object's fields
 */


 /**
  * Create a record
  * @method create
  * @param  {Object}  values  An object holding the initial values of the record's fields
  * @return {Object}          The created record
  */

 exports.Object.prototype.create = function(values) {
   try {
     return new exports.Record(values, this);
   }
   catch (error) {
     console.log('Error in crud.create() function: ' + error);
     throw error;
   }
 };

 /**
  * Remove a record
  * @method
  */

 exports.Object.prototype.remove = function(values) {
   // TBD
 };
