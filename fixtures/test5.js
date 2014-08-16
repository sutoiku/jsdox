/**
  @overview This sample will output module requires and members.
  @license MIT
  @version 0.0.1
  @author lemori
*/

/**
  init system configuration
  @module base
  @requires './model/settings'
*/
var QRCODE_DIR, ROOT, UPLOAD_DIR, init, path, settings;

path = require('path');

settings = require('./model/settings');


/** @member */

ROOT = '.';


/** @member */

UPLOAD_DIR = 'upload';


/** @member */

QRCODE_DIR = 'qrcode';


/**
    Read global config from database
    @public
    @function init
 */

init = function() {
  console.log('init()');
};

exports.init = init;
