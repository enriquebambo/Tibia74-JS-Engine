const Formulas = requireModule("formulas");

module.exports = function energyBeam(source, target) {
  const range = Formulas.damageFormula(source.getLevel(), source.getLevel(), 80, 15);
  const damage = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  target.decreaseHealth(source, damage, CONST.COLOR.LIGHTBLUE);
  process.gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.ENERGYHIT);
  return 1000;
};
