module.exports = function undeadLegion(source, target) {
  source.sayEmote("Undead Legion!");
  process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.MORTAREA);
  return 1000;
};
