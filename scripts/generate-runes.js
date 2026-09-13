const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const runesDir = path.join(projectRoot, 'data/740/runes/definitions');

function writeFile(name, content) {
  const filePath = path.join(runesDir, name);
  fs.writeFileSync(filePath, content.trim() + '\n');
  console.log('Wrote:', filePath);
}

writeFile('antidote-rune.js', `
module.exports = function antidoteRune(source, target) {
  source.removeCondition(Condition.prototype.POISONED);
  gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);
  return true;
};
`);

writeFile('intense-healing-rune.js', `
const Formulas = requireModule("formulas");
module.exports = function intenseHealingRune(source, target) {
  const result = Formulas.healingFormula(source.getLevel(), source.getMagicLevel(), 40, 10, 100);
  const amount = Math.floor(Math.random() * (result.max - result.min + 1)) + result.min;
  target.increaseHealth(amount);
  gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
  return true;
};
`);

writeFile('animate-dead.js', `
module.exports = function animateDead(source, target) {
  source.sayEmote("Animate Dead!");
  gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.MORTAREA);
  return true;
};
`);

writeFile('paralyze.js', `
module.exports = function paralyzeRune(source, target) {
  target.addCondition(Condition.prototype.PARALYZE, 10000, 5);
  gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.PURPLEENERGY);
  return true;
};
`);

const runeDefs = {
  "2268": "sudden-death.js",
  "2311": "heavy-magic-missile.js",
  "2304": "fireball.js",
  "2301": "firefield.js",
  "2277": "energyfield.js",
  "2285": "poisonfield.js",
  "2293": "magicwall.js",
  "2261": "destroyfield.js",
  "2273": "ultimate-healing.js",
  "2305": "fire-bomb.js",
  "2312": "teleport.js",
  "2300": "hearthrune.js",
  "3172": "poisonfield.js",
  "3173": "poison-bomb.js",
  "3176": "poison-wall.js",
  "3188": "firefield.js",
  "3192": "fire-bomb.js",
  "3190": "fire-wall.js",
  "3164": "energyfield.js",
  "3151": "energy-bomb.js",
  "3166": "energy-wall.js",
  "3195": "soulfire.js",
  "3179": "envenom.js",
  "3189": "fireball.js",
  "3191": "great-fireball.js",
  "3174": "light-magic-missile.js",
  "3198": "heavy-magic-missile.js",
  "3200": "explosion.js",
  "3155": "sudden-death.js",
  "3153": "antidote-rune.js",
  "3152": "intense-healing-rune.js",
  "3160": "ultimate-healing.js",
  "3203": "animate-dead.js",
  "3197": "disintegrate.js",
  "3148": "destroyfield.js",
  "3178": "chameleon.js",
  "3177": "convince-creature.js",
  "3180": "magicwall.js",
  "3156": "wild-growth.js",
  "3165": "paralyze.js"
};

fs.writeFileSync(path.join(projectRoot, 'data/740/runes/definitions.json'), JSON.stringify(runeDefs, null, 2));
console.log('Wrote: runes definitions.json');
