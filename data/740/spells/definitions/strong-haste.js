module.exports = function strongHaste(source, target) {
  source.addCondition(Condition.prototype.HASTE, 20000, 70);
  process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);
  return 1000;
};
