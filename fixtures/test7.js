/**
 * @overview Test classes without methods.
 * @license MIT
 * @author Gabor Sar
 */

/**
 * Test class.
 *
 * @class Test
 * @param {*} aa First parameter.
 * @param {*} bb Second parameter.
 */
function Test(aa, bb) {

    /**
     * @member {*} a First member.
     */
    this.a = aa;

    /**
     * @member {*} b Second member.
     */
    this.b = bb;
}


/**
This is mm function
 * @param cc the first param is cc
 * @ returns always 0
*/
Test.prototype.mm = function(cc) {
  return 0;
};
