"use strict";

// Simple test script for Warnibia war systems
console.log("=== Warnibia War Systems Test ===\n");

// Test 1: Config loading
console.log("Test 1: Config loading");
try {
  const config = require("./config.json");
  if(config.WARNIBIA) {
    console.log("  PASS: WARNIBIA config section exists");
    console.log("  Character creation level:", config.WARNIBIA.CHARACTER_CREATION.LEVEL);
    console.log("  Arena rotation:", config.WARNIBIA.ARENA.ROTATION_DURATION_SECONDS, "seconds");
  } else {
    console.log("  FAIL: WARNIBIA config missing");
  }
} catch(e) {
  console.log("  FAIL:", e.message);
}

// Test 2: War system module exists
console.log("\nTest 2: War system module");
try {
  const WarSystem = require("./src/systems/war-system");
  console.log("  PASS: WarSystem module loads");
  
  // Test instantiation
  const war = new WarSystem();
  console.log("  PASS: WarSystem instantiates");
  
  // Test config access
  if(war.config && war.config.WARNIBIA) {
    console.log("  PASS: WarSystem has config");
  } else {
    console.log("  FAIL: WarSystem missing config");
  }
} catch(e) {
  console.log("  FAIL:", e.message);
}

// Test 3: Character creator defaults
console.log("\nTest 3: Character creator defaults");
try {
  const CharacterCreator = require("./src/character-creator");
  const creator = new CharacterCreator();
  const char = JSON.parse(creator.create("Test", "male"));
  
  if(char.properties.health === 250 && char.properties.mana === 200) {
    console.log("  PASS: Starting HP/Mana correct");
  } else {
    console.log("  FAIL: HP/Mana incorrect:", char.properties.health, char.properties.mana);
  }
  
  if(char.skills.experience === 98800) {
    console.log("  PASS: Starting EXP correct");
  } else {
    console.log("  FAIL: EXP incorrect:", char.skills.experience);
  }
  
  if(char.skills.magic === 40) {
    console.log("  PASS: Starting ML correct");
  } else {
    console.log("  FAIL: ML incorrect:", char.skills.magic);
  }
} catch(e) {
  console.log("  FAIL:", e.message);
}

// Test 4: Combat handler fix
console.log("\nTest 4: Combat handler");
try {
  const CombatHandler = require("./src/world-combat-handler");
  const handler = new CombatHandler();
  console.log("  PASS: CombatHandler loads");
} catch(e) {
  console.log("  FAIL:", e.message);
}

// Test 5: Spells definitions
console.log("\nTest 5: Spells definitions");
try {
  const spells = require("./data/740/spells/definitions.json");
  console.log("  PASS: Spells definitions load");
  console.log("  Total spells:", Object.keys(spells).length);
  
  const requiredSpells = ["exura-gran", "exura-vita", "utani-hur", "utani-gran-hur", "utamo-vita", "exori"];
  let allFound = true;
  requiredSpells.forEach(spell => {
    if(!Object.values(spells).includes(spell + ".js")) {
      console.log("  MISSING:", spell);
      allFound = false;
    }
  });
  if(allFound) {
    console.log("  PASS: All required spells defined");
  }
} catch(e) {
  console.log("  FAIL:", e.message);
}

console.log("\n=== Test Complete ===");
