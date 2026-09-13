module.exports = function explosion(source, target) {

  /*

   * Function explosion

   * Creature explosion function

   */

  process.gameServer.world.applyEnvironmentalDamage(source, 40, CONST.COLOR.ORANGE);

  process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.HITBYFIRE);

  return 1000;

};
