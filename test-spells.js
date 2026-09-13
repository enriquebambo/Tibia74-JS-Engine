const assert = require('assert');

// Minimal stubs so engine modules can load for spellbook/formulas
process.gameServer = {
  world: {
    sendMagicEffect: () => {},
    sendDistanceEffect: () => {},
  },
  database: {}
};
global.CONST = {
  PROPERTIES: { HEALTH: 1, MANA: 2, DIRECTION: 3, EXPERIENCE: 4, MAGIC: 5, SPEED: 6 },
  EFFECT: { MAGIC: { MAGIC_GREEN: 1, MAGIC_BLUE: 2 }, PROJECTILE: { DEATH: 3 } },
  DIRECTION: { NORTH: 0, EAST: 1 }
};
global.CancelMessagePacket = function(){};
global.SpellCastPacket = function(){};

const Formulas = require('./src/systems/formulas');

const dmg = Formulas.damageFormula(20, 10, 100, 10);
assert.strictEqual(dmg.min, 63);
assert.strictEqual(dmg.max, 77);

const heal = Formulas.healingFormula(20, 10, 100, 10, 80, 300);
assert.strictEqual(heal.min, 72);
assert.strictEqual(heal.max, 88);

const compute = Formulas.computeFormula(20, 10, 100, 10);
assert.ok(compute >= 63 && compute <= 77);

console.log('formulas ok');

const Spellbook = require('./src/spellbook');

const mocked = {
  spellbook: { spells: new Set() },
  write: () => {},
  skills: {
    getSkillLevel: () => 10
  },
  getTarget: () => mocked,
  properties: {
    getProperty: () => 1
  },
  position: {
    getPositionFromDirection: () => ({ x: 0, y: 0, z: 7 }),
    rotate2D: (dir, dx, dy) => ({ x: dx, y: dy, z: 7 })
  },
  incrementProperty: () => {},
  addCondition: () => true,
  decreaseHealth: () => {},
  increaseHealth: () => {},
  broadcast: () => {},
  sayEmote: () => {},
  isPlayer: () => true
};

const book = new Spellbook(mocked);

mocked.spellbook.spells.add(15);

const called = { cooldown: null };
process.gameServer.database = {
  getSpell: (sid) => {
    if (sid === 15) return () => { called.cooldown = 20; return 20; };
    return null;
  }
};

const result = book.handleSpell(15);
assert.strictEqual(result, true);
assert.strictEqual(called.cooldown, 20);

console.log('spellbook handleSpell ok');

