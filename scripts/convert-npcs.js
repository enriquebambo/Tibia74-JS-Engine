const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/HP/Desktop/TibiaCorePublic/data/npc';
const dstDir = 'C:/Users/HP/Desktop/Warnibia/data/740/npcs/definitions';
const scriptDir = path.join(dstDir, 'script');
const mapFile = 'C:/Users/HP/Desktop/Warnibia/data/740/npcs/definitions.json';

if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });
if (!fs.existsSync(scriptDir)) fs.mkdirSync(scriptDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.npc') && !f.endsWith('.npcoff'));
const map = {};
const skipped = [];

files.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const name = file.replace('.npc', '');
  const content = fs.readFileSync(srcPath, 'utf8');
  
  try {
    const npc = parseNPC(content, name);
    const dstPath = path.join(dstDir, `${name}.json`);
    fs.writeFileSync(dstPath, JSON.stringify(npc, null, 2));
    map[name] = { position: npc.conversation ? npc.conversation.position : { x: 32369, y: 32241, z: 8 }, enabled: true, definition: `${name}.json` };
  } catch (e) {
    skipped.push({ file, error: e.message });
  }
});

fs.writeFileSync(mapFile, JSON.stringify(map, null, 2));
console.log(`Converted ${Object.keys(map).length} NPCs`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length}:`);
  skipped.forEach(s => console.log(`  ${s.file}: ${s.error}`));
}

function parseNPC(content, name) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  
  const npc = {
    creatureStatistics: {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      health: 100,
      maxHealth: 100,
      mana: 0,
      maxMana: 0,
      attack: 5,
      attackSlowness: 1000,
      defense: 5,
      speed: 100,
      outfit: { id: 136, details: { head: 0, body: 0, legs: 0, feet: 0 } }
    },
    behaviour: {
      wanderRange: 0,
      openDoors: false,
      ignoreCharacters: true
    },
    conversation: {
      position: { x: 32369, y: 32241, z: 8 },
      hearingRange: 4,
      keywords: {},
      trade: [],
      farewells: ["bye", "farewell"],
      greetings: ["hello", "hi"],
      sayings: { texts: [], slowness: 300, chance: 0.5 }
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    if (line.startsWith('Name = ')) {
      npc.creatureStatistics.name = line.match(/Name = "(.+)"/)?.[1] || name;
    } else if (line.startsWith('Outfit = ')) {
      const match = line.match(/Outfit = \((\d+),(\d+)-(\d+)-(\d+)-(\d+)\)/);
      if (match) {
        npc.creatureStatistics.outfit = {
          id: parseInt(match[1]),
          details: {
            head: parseInt(match[2]),
            body: parseInt(match[3]),
            legs: parseInt(match[4]),
            feet: parseInt(match[5])
          }
        };
      }
    } else if (line.startsWith('Home = [')) {
      const match = line.match(/Home = \[(\d+),(\d+),(\d+)\]/);
      if (match) {
        npc.conversation.position = {
          x: parseInt(match[1]),
          y: parseInt(match[2]),
          z: parseInt(match[3])
        };
      }
    } else if (line.startsWith('Radius = ')) {
      const radius = parseInt(line.match(/Radius = (\d+)/)?.[1] || '0');
      npc.behaviour.wanderRange = radius;
    } else if (line === 'Behaviour = {') {
      i++;
      while (i < lines.length && lines[i] !== '}') {
        const bline = lines[i];
        if (bline.includes('OPENDOOR')) npc.behaviour.openDoors = true;
        if (bline.includes('IGNORE')) npc.behaviour.ignoreCharacters = true;
        i++;
      }
    } else if (line.startsWith('"')) {
      const keywordMatch = line.match(/^"([^"]+)"\s*->\s*"([^"]*)"/);
      if (keywordMatch) {
        const keyword = keywordMatch[1].toLowerCase();
        const response = keywordMatch[2];
        if (response) {
          npc.conversation.keywords[keyword] = response;
        }
      }
    }
    
    i++;
  }

  if (!npc.conversation.greetings.length) {
    npc.conversation.greetings = ["hello"];
  }

  return npc;
}
