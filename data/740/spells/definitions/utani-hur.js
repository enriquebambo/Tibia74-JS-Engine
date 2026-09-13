const Condition = requireModule("condition");

module.exports = function utaniHur(source, target) {

  /*
   * function utaniHur
   * Code that handles the utani hur spell
   */

  let speedBonus = 150;
  let duration = 33;

  source.addCondition(Condition.prototype.HASTE, duration, 1);

  process.process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);

  return 1000;

}
