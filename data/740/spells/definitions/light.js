const Formulas = requireModule("formulas");

module.exports = function light(source, target) {

  /*

   * Function light

   * Code that handles the light spell

   */

  process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.ENERGY);

  return 1000;

};
