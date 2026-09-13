const Formulas = requireModule("formulas");

module.exports = function fireWave(source, target) {
  const range = Formulas.damageFormula(source.getLevel(), source.getLevel(), 120, 25);
  const damage = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  target.decreaseHealth(source, damage, CONST.COLOR.ORANGE);
  process.gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.FIREAREA);
  return 1000;
};
