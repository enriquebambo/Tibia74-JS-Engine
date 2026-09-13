const Formulas = requireModule("formulas");

module.exports = function poisonStorm(source, target) {
  const range = Formulas.damageFormula(source.getLevel(), source.getLevel(), 180, 35);
  const damage = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  target.decreaseHealth(source, damage, CONST.COLOR.GREEN);
  process.gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.POISONAREA);
  return 1000;
};
