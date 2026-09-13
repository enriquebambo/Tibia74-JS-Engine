"use strict";

const { SpellAddPacket, SpellCastPacket } = requireModule("protocol");

const Spellbook = function(player, data) {

  /*
   * Class Spellbook
   * Container for all spells that a player has and handles casting / cooldowns
   */

  // Circular reference
  this.player = player;

  // The map of spells that are currently on cooldown
  this.__spellCooldowns = new Map();

  this.__cooldowns = data.cooldowns;

  // The set of available spell identifiers
  this.__availableSpells = new Set(data.availableSpells);

}

Spellbook.prototype.GLOBAL_COOLDOWN = 0xFFFF;
Spellbook.prototype.GLOBAL_COOLDOWN_DURATION = 20;

Spellbook.prototype.getAvailableSpells = function() {

  /*
   * Function Spellbook.getAvailableSpells
   * Returns the spells that are available in the player's spellbook
   */

  return this.__availableSpells;

}

Spellbook.prototype.toJSON = function() {

  /*
   * Function Spellbook.toJSON
   * Implements the toJSON API to serialize the spellbook when writing to file
   */

  // Serialize
  return new Object({
    "availableSpells": Array.from(this.__availableSpells),
    "cooldowns": Array.from(this.__spellCooldowns).map(this.__serializeCooldown, this)
  });

}

Spellbook.prototype.__serializeCooldown = function([ key, value ]) {

  /*
   * Function Spellbook.__serializeCooldown
   * Serializes the cooldowns
   */

  return new Object({
    "sid": key,
    "cooldown": value.remainingFrames()
  });

}

Spellbook.prototype.addAvailableSpell = function(sid) {

  /*
   * Function Spellbook.addAvailableSpell
   * Adds an available spell to the player's spellbook
   */

  // Add it
  this.__availableSpells.add(sid);

  // Inform the player they have learned a new spell
  this.player.sendCancelMessage("You have learned a new spell!");

  this.player.write(new SpellAddPacket(sid));

}

Spellbook.prototype.handleSpell = function(sid) {

  /*
   * Function Spellbook.handleSpell
   * Handles casting of a spell by an entity
   */

  // Ignore cast requests that are already on cooldown
  if(this.__spellCooldowns.has(this.GLOBAL_COOLDOWN) || this.__spellCooldowns.has(sid)) {
    return;
  }

  // Try to get the spell
  let spell = gameServer.database.getSpell(sid);

  // Does not exist
  if(spell === null) {
    return;
  }

  // The player does not own this spell
  if(!this.__availableSpells.has(sid)) {
    return;
  }

  // Resolve target: explicit target if set, otherwise self for safety
  let target = this.player.getTarget();
  if(target === null || target === undefined) {
    target = this.player;
  }

  if(sid === 6 || sid === 16) {
    let start = this.player.position.copy();
    let end = target === this.player ? start : target.position.copy();
    this.__applyAreaEffect(sid, start, end);
    return;
  }

  // Generic area spells defined with canonical area maps
  const areaSpell = this.__getAreaSpell(sid);
  if(areaSpell) {
    let start = this.player.position.copy();
    let end = target === this.player ? start : target.position.copy();
    this.__applyAreaEffect(areaSpell.area, start, end, areaSpell);
    return;
  }

  // Call with reference to player and resolved target
  let cooldown = spell.call(this.player, this.player, target);

  // Zero cooldown means that the cast was unsuccesful
  if(cooldown === 0) {
    return;
  }

  // Write a packet to the player that the spell needs to be put on cooldown by a number of frames
  this.player.write(new SpellCastPacket(sid, cooldown));

  // Lock it
  this.__lockSpell(sid, cooldown);

}

Spellbook.prototype.__lockSpell = function(sid, duration) {

  /*
   * Function Spellbook.__lockSpell
   * Handles locking of a spell by adding it to the cooldown map. A reference to the locked down event is included
   */

  // Also lock to the global cooldown
  this.__internalLockSpell(sid, duration);
  this.__internalLockSpell(this.GLOBAL_COOLDOWN, this.GLOBAL_COOLDOWN_DURATION);

}

Spellbook.prototype.applyCooldowns = function() {

  /*
   * Function Spellbook.applyCooldowns
   * Applies the serialized cooldowns when the player logs in
   */

  // Apply a correction for the duration the player has been offline
  let correction = (Date.now() - this.player.lastVisit);

  this.__cooldowns.forEach(function({ sid, cooldown }) {

    cooldown = Math.max(0, cooldown - (correction / CONFIG.SERVER.MS_TICK_INTERVAL));

    // Cooldown of zero: not needed
    if(cooldown === 0) {
      return;
    }

    // Lock and inform
    this.__internalLockSpell(sid, cooldown);
    this.player.write(new SpellCastPacket(sid, cooldown));

  }, this);

}

Spellbook.prototype.writeSpells = function(gameSocket) {

  /*
   * Function Spellbook.writeSpells
   * Serializes the spellbook as a binary packet
   */

  this.__availableSpells.forEach(sid => gameSocket.write(new SpellAddPacket(sid)));

}

Spellbook.prototype.__internalLockSpell = function(sid, duration) {

  /*
   * Function Spellbook.__internalLockSpell
   * Internal function actually schedule the lock
   */

  this.__spellCooldowns.set(sid, gameServer.world.eventQueue.addEvent(this.__unlockSpell.bind(this, sid), duration));

}

Spellbook.prototype.__unlockSpell = function(sid) {

  /*
   * Function Spellbook.__unlockSpell
   * Handles unlocking of a spell by deleting it from the cooldown map
   */

  this.__spellCooldowns.delete(sid);

};

Spellbook.prototype.__getAreaSpell = function(sid) {

  /*
   * Function Spellbook.__getAreaSpell
   * Returns area spell metadata for supported area-effect spells
   */

  const Formulas = requireModule("formulas");
  const map = {
    1: { area: "wave3", effect: CONST.EFFECT.MAGIC.FIREAREA, color: CONST.COLOR.ORANGE, base: 80, variation: 20 },
    2: { area: "beam5", effect: CONST.EFFECT.MAGIC.ENERGYHIT, color: CONST.COLOR.LIGHTBLUE, base: 40, variation: 10 },
    3: { area: "beam7", effect: CONST.EFFECT.MAGIC.ENERGYHIT, color: CONST.COLOR.LIGHTBLUE, base: 100, variation: 20 },
    4: { area: "wave6", effect: CONST.EFFECT.MAGIC.MORTAREA, color: CONST.COLOR.LIGHTBLUE, base: 120, variation: 30 },
    5: { area: "squareWave5", effect: CONST.EFFECT.MAGIC.FIREAREA, color: CONST.COLOR.ORANGE, base: 60, variation: 15 },
    6: { area: "squareWave6", effect: CONST.EFFECT.MAGIC.MORTAREA, color: CONST.COLOR.LIGHTBLUE, base: 140, variation: 25 },
    7: { area: "squareWave7", effect: CONST.EFFECT.MAGIC.MORTAREA, color: CONST.COLOR.LIGHTBLUE, base: 200, variation: 40 },
    16: { area: "beam8", effect: CONST.EFFECT.MAGIC.ENERGYHIT, color: CONST.COLOR.LIGHTBLUE, base: 200, variation: 30 }
  };

  return map[sid] || null;

};

Spellbook.prototype.__getDirection = function(source, target) {

  /*
   * Function Spellbook.__getDirection
   * Returns the direction from source to target for area rotation
   */

  if(target === source) {
    return source.getProperty(CONST.PROPERTIES.DIRECTION) || 2;
  }

  let dx = target.position.x - source.position.x;
  let dy = target.position.y - source.position.y;

  if(Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 2 : 4;
  } else if(dy !== 0) {
    return dy > 0 ? 3 : 1;
  }

  return source.getProperty(CONST.PROPERTIES.DIRECTION) || 2;

};

Spellbook.prototype.__applyAreaEffect = function(area, start, end, areaSpell) {

  /*
   * Function Spellbook.__applyAreaEffect
   * Applies an area spell effect using canonical area matrices
   */

  const Formulas = requireModule("formulas");
  const source = this.player;
  const direction = this.__getDirection(source, source.getTarget && source.getTarget() === source ? source : source.getTarget()) || 2;
  let areaName = area;
  let spellMeta = areaSpell || null;

  if(typeof area === "number") {
    areaName = area;
    spellMeta = this.__getAreaSpell(area);
  }

  const positions = Formulas.getAreaPositions(areaName, direction);
  if(!positions || !positions.length) {
    return;
  }

  const effect = spellMeta ? spellMeta.effect : CONST.EFFECT.MAGIC.POFF;
  const color = spellMeta ? spellMeta.color : CONST.COLOR.WHITE;
  const base = spellMeta ? spellMeta.base : 0;
  const variation = spellMeta ? spellMeta.variation : 0;

  const FormulasRef = Formulas;
  const level = source.getLevel ? source.getLevel() : 1;
  const maglevel = source.getMagicLevel ? source.getMagicLevel() : 0;

  positions.forEach(function(pos) {

    let tx = start.x + pos.x;
    let ty = start.y + pos.y;
    let tz = start.z;

    if(end && pos.isOrigin) {
      tx = end.x;
      ty = end.y;
      tz = end.z;
    }

    let tile = gameServer.world.getTileFromWorldPosition({ x: tx, y: ty, z: tz });
    if(!tile) {
      return;
    }

    gameServer.world.sendMagicEffect({ x: tx, y: ty, z: tz }, effect);

    tile.creatures.forEach(function(creature) {

      if(base > 0) {
        const range = FormulasRef.damageFormula(level, maglevel, base, variation);
        const damage = Number.prototype.random(range.min, range.max);
        creature.decreaseHealth(source, damage, color);
      }

    });

  });

};

module.exports = Spellbook;
