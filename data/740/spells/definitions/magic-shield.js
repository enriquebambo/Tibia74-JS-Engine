module.exports = function magicShield(source, target) {
  source.addCondition(Condition.prototype.MAGIC_SHIELD, 200000, 1);
  process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
  return 1000;
};
