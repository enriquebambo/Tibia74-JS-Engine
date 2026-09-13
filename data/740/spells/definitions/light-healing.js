const Formulas = requireModule("formulas");

module.exports = function lightHealing(source, target) {
  const result = Formulas.healingFormula(source.getLevel(), source.getLevel(), 20, 10, 100);
  const amount = Math.floor(Math.random() * (result.max - result.min + 1)) + result.min;
  target.increaseHealth(amount);
  process.gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
  return 1000;
};
