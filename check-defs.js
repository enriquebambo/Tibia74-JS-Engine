require('./require');
const fs = require('fs');
const path = require('path');
const defs = JSON.parse(fs.readFileSync(getDataFile('spells','definitions.json'), 'utf8'));
console.log('defs count', Object.keys(defs).length);
for (const [k,v] of Object.entries(defs)) {
  const p = getDataFile('spells/definitions', v);
  console.log(k, v, '=>', p, fs.existsSync(p));
}
