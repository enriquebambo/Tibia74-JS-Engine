const Condition = requireModule("condition");

module.exports = function utaniGranHur(source, target) {

  /*
   * function utaniGranHur
   * Code that handles the utani gran hur spell
   */

  let speedBonus = 250;
  let duration = 20;

  source.addCondition(Condition.prototype.HASTE, duration, 1);

  process.process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);

  return 1000;

}
