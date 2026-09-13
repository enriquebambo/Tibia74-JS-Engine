const fs = require('fs');
const path = require('path');

global.requireModule = function(name) {
  if (name === 'formulas') {
    return require(path.join(__dirname, '..', 'src', 'systems', 'formulas.js'));
  }
  if (name === 'condition') {
    return function Condition() {};
  }
  if (name === 'position') {
    return function Position() {};
  }
  return function() {};
};

const spellsDir = path.join(__dirname, '..', 'data/740/spells/definitions');
const runesDir = path.join(__dirname, '..', 'data/740/runes/definitions');

const files = fs.readdirSync(spellsDir).filter(f => f.endsWith('.js') && f !== 'definitions.json');
for (const file of files) {
  const filePath = path.join(spellsDir, file);
  const code = fs.readFileSync(filePath, 'utf8');
  const m = new Module(filePath, module);
  m._compile(code, filePath);
  const fn = m.exports;
  if (typeof fn !== 'function') {
    console.log('spell', file, 'SKIP not function');
    continue;
  }
  try {
    const source = {
      getLevel: () => 20,
      getMagicLevel: () => 40,
      position: {},
      getTarget: () => ({ position: {} }),
      increaseHealth(){},
      decreaseHealth(){},
      sayEmote(){},
      addCondition(){},
      getProperty(){ return 2; },
      __getSpellPosition(dx, dy) { return { x: dx, y: dy }; }
    };
    const target = { position: {}, increaseHealth(){}, decreaseHealth(){} };
    fn.call(source, source, target);
    console.log('spell', file, 'OK');
  } catch (e) {
    console.log('spell', file, 'ERR', e.message);
  }
}

const runeFiles = fs.readdirSync(runesDir).filter(f => f.endsWith('.js'));
for (const file of runeFiles) {
  const filePath = path.join(runesDir, file);
  const code = fs.readFileSync(filePath, 'utf8');
  const m = new Module(filePath, module);
  m._compile(code, filePath);
  const fn = m.exports;
  if (typeof fn !== 'function') {
    console.log('rune', file, 'SKIP not function');
    continue;
  }
  try {
    const source = { position: {}, getLevel: () => 20, getMagicLevel: () => 40 };
    const target = { position: {} };
    fn.call(source, source, target);
    console.log('rune', file, 'OK');
  } catch (e) {
    console.log('rune', file, 'ERR', e.message);
  }
}
