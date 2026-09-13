module.exports = function antidote(source, target) {
  source.removeCondition(Condition.prototype.POISONED);
  process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);
  return 1000;;
};
