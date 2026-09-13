module.exports = function haste(source, target) {
  source.addCondition(Condition.prototype.HASTE, 30000, 30);
  process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);
  return 100;
};
