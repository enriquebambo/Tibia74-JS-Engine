"use strict";

const path = require("path");

// Mimic engine globals
global.getDataFile = function() {
  return path.join(__dirname, "data", "740", ...arguments);
};

global.CONFIG = {
  WORLD: {
    NPCS: { ENABLED: false },
    SPAWNS: { ENABLED: false },
    WORLD_FILE: "world/Tibia74.otbm"
  }
};

const fs = require("fs");

console.log("=== Debug runes/spells loading ===\n");

// Check definitions.json files
const runesJsonPath = getDataFile("runes", "definitions.json");
const spellsJsonPath = getDataFile("spells", "definitions.json");

console.log("Runes JSON path:", runesJsonPath);
console.log("Runes JSON exists:", fs.existsSync(runesJsonPath));

console.log("\nSpells JSON path:", spellsJsonPath);
console.log("Spells JSON exists:", fs.existsSync(spellsJsonPath));

if(fs.existsSync(runesJsonPath)) {
  const runes = JSON.parse(fs.readFileSync(runesJsonPath, "utf8"));
  console.log("\nRunes JSON content:", runes);
  console.log("Runes count:", Object.keys(runes).length);
}

if(fs.existsSync(spellsJsonPath)) {
  const spells = JSON.parse(fs.readFileSync(spellsJsonPath, "utf8"));
  console.log("\nSpells JSON content:", spells);
  console.log("Spells count:", Object.keys(spells).length);
}

// Check definitions directories
const runesDir = getDataFile("runes", "definitions");
const spellsDir = getDataFile("spells", "definitions");

console.log("\nRunes dir path:", runesDir);
console.log("Runes dir exists:", fs.existsSync(runesDir));

console.log("\nSpells dir path:", spellsDir);
console.log("Spells dir exists:", fs.existsSync(spellsDir));

if(fs.existsSync(runesDir)) {
  const files = fs.readdirSync(runesDir).filter(f => f.endsWith(".js"));
  console.log("\nRune JS files:", files);
}

if(fs.existsSync(spellsDir)) {
  const files = fs.readdirSync(spellsDir).filter(f => f.endsWith(".js"));
  console.log("\nSpell JS files:", files);
}
