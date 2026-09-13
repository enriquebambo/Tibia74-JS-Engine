module.exports = function invisibility(source, target) {
  source.addCondition(Condition.prototype.INVISIBLE, -1, -1, null);
  process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.POFF);
  return 1000;
};
