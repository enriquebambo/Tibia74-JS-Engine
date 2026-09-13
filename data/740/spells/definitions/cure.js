const Condition = requireModule("condition");

module.exports = function cureBurning(source, target) {

  /*

   * Function cureBurning

   * Spell to cure the burning condition from the player

   */

  if(!source.conditions || !source.conditions.has(Condition.prototype.BURNING)) {

    source.sendCancelMessage("You are not burning.");

    return 1000;

  }

  source.removeCondition(Condition.prototype.BURNING);

  process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);

  // Return cooldown

  return 1000;

};
