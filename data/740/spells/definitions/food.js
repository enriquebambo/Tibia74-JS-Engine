module.exports = function food(source, target) {
  source.increaseHealth(25);
  process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
  return 1000;
};
