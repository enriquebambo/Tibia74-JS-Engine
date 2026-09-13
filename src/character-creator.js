"use strict";

const Position = requireModule("position");
const Outfit = requireModule("outfit");

const CharacterCreator = function() {

  /*
   * Class CharacterCreator
   * Handler for the creation of new characters
   */

  this.blueprint = new Object({
    "position": new Position(32369, 32241, 8),
    "templePosition": new Position(32369, 32241, 8),
    "properties": {
      "vocation": CONST.VOCATION.NONE,
      "role": CONST.ROLES.NONE,
      "sex": CONST.SEX.MALE,
      "maxCapacity": CONFIG.WARNIBIA.CHARACTER_CREATION.CAPACITY,
      "availableMounts": [],
      "availableOutfits": [],
      "name": "Unknown",
      "attack": 4,
      "attackSpeed": 20,
      "defense": 2,
      "direction": CONST.DIRECTION.NORTH,
      "health": CONFIG.WARNIBIA.CHARACTER_CREATION.HP,
      "mana": CONFIG.WARNIBIA.CHARACTER_CREATION.MANA,
      "outfit": new Outfit({
        "id": 0,
        "details": {
          "head": 78,
          "body": 69,
          "legs": 58,
          "feet": 76
        },
        "mount": 0,
        "mounted": false,
        "addonOne": false,
        "addonTwo": false
      }),
      "speed": CONFIG.WARNIBIA.CHARACTER_CREATION.MOVEMENT_SPEED
    },
    "skills": {
      "experience": CONFIG.WARNIBIA.CHARACTER_CREATION.EXPERIENCE,
      "magic": CONFIG.WARNIBIA.CHARACTER_CREATION.MAGIC_LEVEL,
      "fist": 10,
      "club": 10,
      "sword": 10,
      "axe": 10,
      "distance": CONFIG.WARNIBIA.CHARACTER_CREATION.SKILLS.distance,
      "shielding": CONFIG.WARNIBIA.CHARACTER_CREATION.SKILLS.shielding,
      "fishing": CONFIG.WARNIBIA.CHARACTER_CREATION.SKILLS.fishing
    },
    "spellbook": {
      "availableSpells": [2, 8, 9, 10, 11, 12, 13, 14, 15],
      "cooldowns": []
    },
    "containers": {
      "keyring": [],
      "depot": [],
      "inbox": [],
      "equipment": []
    },
    "friends": []
  });

}

CharacterCreator.prototype.create = function(name, sex) {

  /*
   * CharacterCreator.create
   * Creates a new character with the given properties
   */

  // Memory copy of the template
  let copiedTemplate = JSON.parse(JSON.stringify(this.blueprint));

  // Replace the character name
  copiedTemplate.properties.name = name;

  // And sex specific attributes
  if(sex === "male") {
    copiedTemplate.properties.sex = CONST.SEX.MALE;
    copiedTemplate.properties.outfit.id = CONST.LOOKTYPES.MALE.CITIZEN;
    copiedTemplate.properties.availableOutfits = new Array(
      CONST.LOOKTYPES.MALE.CITIZEN,
      CONST.LOOKTYPES.MALE.HUNTER,
      CONST.LOOKTYPES.MALE.MAGE,
      CONST.LOOKTYPES.MALE.KNIGHT
    );
  } else if(sex === "female") {
    copiedTemplate.properties.sex = CONST.SEX.FEMALE;
    copiedTemplate.properties.outfit.id = CONST.LOOKTYPES.FEMALE.CITIZEN;
    copiedTemplate.properties.availableOutfits = new Array(
      CONST.LOOKTYPES.FEMALE.CITIZEN,
      CONST.LOOKTYPES.FEMALE.HUNTER,
      CONST.LOOKTYPES.FEMALE.MAGE,
      CONST.LOOKTYPES.FEMALE.KNIGHT
    );
  }

  // Return the template as a string to write it to the filesystem
  return JSON.stringify(copiedTemplate);

}


module.exports = CharacterCreator;
