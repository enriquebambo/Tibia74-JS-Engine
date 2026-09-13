const Formulas = requireModule("formulas");

module.exports = function massHealing(source, target) {
  const result = Formulas.healingFormula(source.getLevel(), source.getLevel(), 60, 15, 100);
  const amount = Math.floor(Math.random() * (result.max - result.min + 1)) + result.min;
  source.increaseHealth(amount);
  process.gameServer.world.sendMagicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
  return 1000;
};
