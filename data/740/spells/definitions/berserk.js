const Formulas = requireModule("formulas");

module.exports = function berserk(source, target) {
  const range = Formulas.damageFormula(source.getLevel(), source.getLevel(), 120, 25);
  const damage = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  target.decreaseHealth(source, damage, CONST.COLOR.RED);
  process.gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.BLOCKHIT);
  return 1000;
};
