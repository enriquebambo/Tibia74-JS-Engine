"use strict";

const ChannelManager = requireModule("channel-manager");
const CombatHandler = requireModule("world-combat-handler");
const CreatureHandler = requireModule("world-creature-handler");
const EventQueue = requireModule("eventqueue");
const Lattice = requireModule("lattice");
const WorldClock = requireModule("world-clock");

const { PlayerLogoutPacket, ServerMessagePacket, EffectMagicPacket, EffectDistancePacket } = requireModule("protocol");

const WarSystem = function() {

  /*
   * Class WarSystem
   * Central container for all Warnibia war systems
   */

  this.config = CONFIG.WARNIBIA || {};
  this.world = null;
  this.currentArena = "thais";
  this.arenaRotationTimer = null;
  this.rotationEndTime = null;
  this.announcedMinutes = [];

  // Kill tracking: Map<playerName, {kills, deaths, killStreak, lastKillTarget, lastKillTime}>
  this.playerStats = new Map();

  // Spawn protection: Map<playerName, {expiresAt: timestamp}>
  this.spawnProtection = new Map();

};

WarSystem.prototype.initialize = function(world) {

  /*
   * Function WarSystem.initialize
   * Initializes the war system with the world reference
   */

  try {
    this.world = gameServer.world;

    this.resetArenaRotation();

    this.startArenaRotation();

    console.log("Warnibia war systems initialized.");
  } catch(error) {
    console.error("Failed to initialize Warnibia war systems:", error);
  }

};

WarSystem.prototype.getRandomSpawn = function() {

  /*
   * Function WarSystem.getRandomSpawn
   * Returns a random spawn position for the current arena
   */

  try {
    let arenaConfig = this.config.ARENA || {};
    let spawns = arenaConfig.SPAWNS && arenaConfig.SPAWNS[this.currentArena];
    
    if(!spawns || spawns.length === 0) {
      return new Position(32369, 32241, 8);
    }

    let spawn = spawns[Math.floor(Math.random() * spawns.length)];
    return new Position(spawn.x, spawn.y, spawn.z);
  } catch(error) {
    return new Position(32369, 32241, 8);
  }

};

WarSystem.prototype.getArenaName = function() {

  /*
   * Function WarSystem.getArenaName
   * Returns the display name of the current arena
   */

  try {
    return this.config.ARENA.SPAWNS && Object.keys(this.config.ARENA.SPAWNS).includes(this.currentArena) 
      ? this.currentArena.charAt(0).toUpperCase() + this.currentArena.slice(1)
      : "Thais";
  } catch(error) {
    return "Thais";
  }

};

WarSystem.prototype.getRotationTimeRemaining = function() {

  /*
   * Function WarSystem.getRotationTimeRemaining
   * Returns the remaining time until arena rotation in seconds
   */

  try {
    if(!this.rotationEndTime) {
      this.resetArenaRotation();
    }
    return Math.max(0, Math.floor((this.rotationEndTime - Date.now()) / 1000));
  } catch(error) {
    return 1800;
  }

};

WarSystem.prototype.resetArenaRotation = function() {

  /*
   * Function WarSystem.resetArenaRotation
   * Resets the arena rotation timer
   */

  try {
    let duration = (this.config.ARENA && this.config.ARENA.ROTATION_DURATION_SECONDS) || 1800;
    this.rotationEndTime = Date.now() + (duration * 1000);
    this.announcedMinutes = [];
  } catch(error) {
    this.rotationEndTime = Date.now() + 1800000;
  }

};

WarSystem.prototype.startArenaRotation = function() {

  /*
   * Function WarSystem.startArenaRotation
   * Starts the arena rotation timer
   */

  try {
    this.resetArenaRotation();
    
    // Check every 30 seconds for rotation announcements
    let self = this;
    this.arenaRotationTimer = setInterval(function() {
      self.checkArenaRotation();
    }, 30000);
  } catch(error) {
    console.error("Failed to start arena rotation:", error);
  }

};

WarSystem.prototype.checkArenaRotation = function() {

  /*
   * Function WarSystem.checkArenaRotation
   * Checks if arena rotation is due and handles it
   */

  try {
    if(!this.rotationEndTime || Date.now() < this.rotationEndTime) {
      return;
    }

    // Rotate to next arena
    this.rotateArena();
  } catch(error) {
    console.error("Arena rotation check failed:", error);
  }

};

WarSystem.prototype.rotateArena = function() {

  /*
   * Function WarSystem.rotateArena
   * Rotates to the next arena in the rotation order
   */

  try {
    let order = (this.config.ARENA && this.config.ARENA.ORDER) || ["thais", "carlin", "venore", "edron"];
    let currentIndex = order.indexOf(this.currentArena);
    let nextIndex = (currentIndex + 1) % order.length;
    let nextArena = order[nextIndex];

    this.broadcastMessage("[WAR] Rotating arena from %s to %s!".format(
      this.getArenaName(),
      nextArena.charAt(0).toUpperCase() + nextArena.slice(1)
    ));

    // Teleport all players to new arena
    let players = this.world.creatureHandler.getConnectedPlayers();
    players.forEach(function(player) {
      if(player.isPlayer && player.isPlayer()) {
        let spawn = gameServer.world.warnibia.getRandomSpawn();
        gameServer.world.creatureHandler.teleportCreature(player, spawn);
        
        // Restore HP/Mana
        player.setFull(CONST.PROPERTIES.HEALTH);
        player.setFull(CONST.PROPERTIES.MANA);
        
        // Refill supplies
        gameServer.world.warnibia.refillSupplies(player);
        
        // Apply spawn protection
        gameServer.world.warnibia.applySpawnProtection(player);
      }
    }, this);

    this.currentArena = nextArena;
    this.resetArenaRotation();

    this.broadcastMessage("[WAR] Welcome to %s!".format(
      nextArena.charAt(0).toUpperCase() + nextArena.slice(1)
    ));

  } catch(error) {
    console.error("Arena rotation failed:", error);
  }

};

WarSystem.prototype.broadcastMessage = function(message) {

  /*
   * Function WarSystem.broadcastMessage
   * Broadcasts a message to all players
   */

  try {
    if(this.world && this.world.broadcastMessage) {
      this.world.broadcastMessage(message);
    }
  } catch(error) {
    // Silent fail
  }

};

WarSystem.prototype.applySpawnProtection = function(player) {

  /*
   * Function WarSystem.applySpawnProtection
   * Applies spawn protection to a player
   */

  try {
    if(!this.config.SPAWN_PROTECTION || !this.config.SPAWN_PROTECTION.ENABLED) {
      return;
    }

    let duration = (this.config.SPAWN_PROTECTION.DURATION_SECONDS) || 5;
    let expiresAt = Date.now() + (duration * 1000);

    this.spawnProtection.set(player.getProperty(CONST.PROPERTIES.NAME), {
      expiresAt: expiresAt,
      duration: duration
    });

    player.sendCancelMessage(this.config.SPAWN_PROTECTION.MESSAGE.format(duration));
  } catch(error) {
    // Silent fail
  }

};

WarSystem.prototype.hasSpawnProtection = function(player) {

  /*
   * Function WarSystem.hasSpawnProtection
   * Returns true if the player has active spawn protection
   */

  try {
    let name = player.getProperty(CONST.PROPERTIES.NAME);
    let protection = this.spawnProtection.get(name);

    if(!protection) {
      return false;
    }

    if(Date.now() > protection.expiresAt) {
      this.spawnProtection.delete(name);
      return false;
    }

    return true;
  } catch(error) {
    return false;
  }

};

WarSystem.prototype.removeSpawnProtection = function(player) {

  /*
   * Function WarSystem.removeSpawnProtection
   * Removes spawn protection from a player
   */

  try {
    this.spawnProtection.delete(player.getProperty(CONST.PROPERTIES.NAME));
  } catch(error) {
    // Silent fail
  }

};

WarSystem.prototype.refillSupplies = function(player) {

  /*
   * Function WarSystem.refillSupplies
   * Refills PvP supplies for a player
   */

  try {
    if(!this.config.SUPPLIES || !this.config.SUPPLIES.ENABLED) {
      return;
    }

    let supplies = this.config.SUPPLIES;
    let backpack = player.containerManager.equipment.peekIndex(CONST.EQUIPMENT.BACKPACK);

    // If no backpack, create one
    if(!backpack) {
      backpack = gameServer.database.createThing(supplies.backpack.itemId);
      player.containerManager.equipment.addThing(backpack, CONST.EQUIPMENT.BACKPACK);
    }

    // Add supplies to backpack
    Object.keys(supplies).forEach(function(key) {
      if(key === "ENABLED" || key === "REFILL_ON_DEATH" || key === "backpack") {
        return;
      }

      let supply = supplies[key];
      if(supply && supply.itemId && supply.count) {
        let item = gameServer.database.createThing(supply.itemId);
        if(item && item.isStackable()) {
          item.setCount(supply.count);
          backpack.addFirstEmpty(item);
        }
      }
    });

  } catch(error) {
    console.error("Failed to refill supplies:", error);
  }

};

WarSystem.prototype.equipPvPLoadout = function(player) {

  /*
   * Function WarSystem.equipPvPLoadout
   * Equips the configured PvP loadout for a player
   */

  try {
    if(!this.config.EQUIPMENT || !this.config.EQUIPMENT.ENABLED) {
      return;
    }

    let equipment = this.config.EQUIPMENT;
    Object.keys(equipment).forEach(function(key) {
      if(key === "ENABLED" || key === "AUTO_EQUIP" || key === "backpack") {
        return;
      }

      let piece = equipment[key];
      if(piece && piece.itemId) {
        let item = gameServer.database.createThing(piece.itemId);
        if(item) {
          // Place in equipment if slot mapping exists
          if(piece.slot && CONST.EQUIPMENT[piece.slot.toUpperCase()] !== undefined) {
            player.containerManager.equipment.addThing(item, CONST.EQUIPMENT[piece.slot.toUpperCase()]);
          } else {
            player.containerManager.equipment.pushItem(item);
          }
        }
      }
    });

  } catch(error) {
    console.error("Failed to equip PvP loadout:", error);
  }

};

WarSystem.prototype.awardPvPExperience = function(killer, victim) {

  /*
   * Function WarSystem.awardPvPExperience
   * Awards PvP experience to the killer
   */

  try {
    if(!this.config.FORMULAS || !this.config.FORMULAS.PVP_EXP) {
      return;
    }

    let killerLevel = killer.skills.getSkillLevel(CONST.PROPERTIES.EXPERIENCE);
    let victimLevel = victim.skills.getSkillLevel(CONST.PROPERTIES.EXPERIENCE);
    let baseExp = this.config.FORMULAS.PVP_EXP.BASE_EXP || 500;
    let divisor = this.config.FORMULAS.PVP_EXP.LEVEL_RATIO_DIVISOR || 1.0;

    // Calculate EXP based on levels
    let exp = Math.floor((victimLevel / Math.max(1, killerLevel * divisor)) * baseExp);
    exp = Math.max(1, exp);

    // Award experience
    killer.skills.increment(CONST.PROPERTIES.EXPERIENCE, exp);

    killer.sendCancelMessage("You received %s PvP experience!".format(exp));

  } catch(error) {
    console.error("Failed to award PvP experience:", error);
  }

};

WarSystem.prototype.updateKillStatistics = function(killer, victim) {

  /*
   * Function WarSystem.updateKillStatistics
   * Updates kill statistics for the killer
   */

  try {
    let killerName = killer.getProperty(CONST.PROPERTIES.NAME);
    let victimName = victim.getProperty(CONST.PROPERTIES.NAME);

    // Get or create killer stats
    let killerStats = this.playerStats.get(killerName) || { kills: 0, deaths: 0, killStreak: 0, lastKillTarget: null, lastKillTime: 0 };
    killerStats.kills++;
    killerStats.killStreak++;
    killerStats.lastKillTarget = victimName;
    killerStats.lastKillTime = Date.now();
    this.playerStats.set(killerName, killerStats);

    // Get or create victim stats
    let victimStats = this.playerStats.get(victimName) || { kills: 0, deaths: 0, killStreak: 0, lastKillTarget: null, lastKillTime: 0 };
    victimStats.deaths++;
    victimStats.killStreak = 0;
    this.playerStats.set(victimName, victimStats);

    // Update killstreak
    this.updateKillStreak(killer, killerStats.killStreak);

  } catch(error) {
    console.error("Failed to update kill statistics:", error);
  }

};

WarSystem.prototype.updateDeathStatistics = function(player) {

  /*
   * Function WarSystem.updateDeathStatistics
   * Updates death statistics for the player
   */

  try {
    let name = player.getProperty(CONST.PROPERTIES.NAME);
    let stats = this.playerStats.get(name) || { kills: 0, deaths: 0, killStreak: 0, lastKillTarget: null, lastKillTime: 0 };
    stats.deaths++;
    stats.killStreak = 0;
    this.playerStats.set(name, stats);
  } catch(error) {
    // Silent fail
  }

};

WarSystem.prototype.updateKillStreak = function(player, killStreak) {

  /*
   * Function WarSystem.updateKillStreak
   * Updates the player's kill streak visual indicator
   */

  try {
    if(!this.config.KILL_STREAK || !this.config.KILL_STREAK.ENABLED) {
      return;
    }

    let thresholds = this.config.KILL_STREAK;
    let skullType = 0; // No skull

    if(killStreak >= thresholds.BLACK_SKULL_KILLS) {
      skullType = 3; // Black skull
    } else if(killStreak >= thresholds.RED_SKULL_KILLS) {
      skullType = 2; // Red skull
    } else if(killStreak >= thresholds.WHITE_SKULL_KILLS) {
      skullType = 1; // White skull
    }

    // Send skull update packet to player
    // Note: This would need a proper packet implementation
    player.sendCancelMessage("Kill streak: %s".format(killStreak));

  } catch(error) {
    // Silent fail
  }

};

WarSystem.prototype.broadcastKillAnnouncement = function(killer, victim) {

  /*
   * Function WarSystem.broadcastKillAnnouncement
   * Broadcasts a kill announcement to all players
   */

  try {
    let message = "[%s] was slain by [%s]!".format(
      victim.getProperty(CONST.PROPERTIES.NAME),
      killer.getProperty(CONST.PROPERTIES.NAME)
    );

    this.broadcastMessage(message);
  } catch(error) {
    // Silent fail
  }

};

WarSystem.prototype.getPlayerStats = function(playerName) {

  /*
   * Function WarSystem.getPlayerStats
   * Returns the stats for a player
   */

  try {
    return this.playerStats.get(playerName) || { kills: 0, deaths: 0, killStreak: 0 };
  } catch(error) {
    return { kills: 0, deaths: 0, killStreak: 0 };
  }

};

WarSystem.prototype.getLeaderboard = function(sortBy) {

  /*
   * Function WarSystem.getLeaderboard
   * Returns the leaderboard sorted by the specified metric
   */

  try {
    sortBy = sortBy || "kills";
    let entries = [];

    this.playerStats.forEach(function(stats, name) {
      entries.push({
        name: name,
        kills: stats.kills || 0,
        deaths: stats.deaths || 0,
        killStreak: stats.killStreak || 0,
        kd: stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills
      });
    }, this);

    // Sort by the specified metric
    entries.sort(function(a, b) {
      return b[sortBy] - a[sortBy];
    });

    return entries.slice(0, 20); // Top 20
  } catch(error) {
    return [];
  }

};

WarSystem.prototype.showLeaderboard = function(player, sortBy) {

  /*
   * Function WarSystem.showLeaderboard
   * Sends the leaderboard to a player
   */

  try {
    let leaderboard = this.getLeaderboard(sortBy);
    
    player.sendCancelMessage("=== WAR LEADERBOARD ===");
    player.sendCancelMessage("Rank  |  Player  |  Kills  |  Deaths  |  K/D  |  Streak");
    player.sendCancelMessage("--------------------------------------------------");
    
    leaderboard.forEach(function(entry, index) {
      let rank = String(index + 1).padStart(4);
      let name = entry.name.padEnd(20);
      let kills = String(entry.kills).padStart(5);
      let deaths = String(entry.deaths).padStart(6);
      let kd = String(entry.kd).padStart(5);
      let streak = String(entry.killStreak).padStart(6);
      
      player.sendCancelMessage("%s | %s | %s | %s | %s | %s".format(rank, name, kills, deaths, kd, streak));
    }, this);
    
    player.sendCancelMessage("--------------------------------------------------");
  } catch(error) {
    player.sendCancelMessage("Failed to load leaderboard.");
  }

};

WarSystem.prototype.handleCommand = function(player, command, args) {

  /*
   * Function WarSystem.handleCommand
   * Handles Warnibia-specific commands
   */

  try {
    let role = player.getProperty(CONST.PROPERTIES.ROLE);
    let permissions = this.config.PERMISSIONS || { PLAYER: 0, GM: 1, ADMIN: 2 };

    // /map command
    if(command === "/map") {
      if(args.length === 0) {
        let timeRemaining = this.getRotationTimeRemaining();
        let minutes = Math.floor(timeRemaining / 60);
        let seconds = timeRemaining % 60;

        player.sendCancelMessage("Current War Arena: %s".format(this.getArenaName()));
        player.sendCancelMessage("Rotation in: %s:%s".format(String(minutes).padStart(2, "0"), String(seconds).padStart(2, "0")));

        let order = (this.config.ARENA && this.config.ARENA.ORDER) || ["thais", "carlin", "venore", "edron"];
        let currentIndex = order.indexOf(this.currentArena);
        let nextIndex = (currentIndex + 1) % order.length;
        let nextArena = order[nextIndex];
        player.sendCancelMessage("Next Arena: %s".format(nextArena.charAt(0).toUpperCase() + nextArena.slice(1)));

        return true;
      }

      // Arena change commands (GM/Admin only)
      if(role >= permissions.ADMIN || role >= permissions.GM) {
        let arena = args[0].toLowerCase();
        let validArenas = ["thais", "carlin", "venore", "edron", "next"];

        if(validArenas.includes(arena)) {
          if(arena === "next") {
            this.rotateArena();
          } else if((this.config.ARENA && this.config.ARENA.SPAWNS && this.config.ARENA.SPAWNS[arena])) {
            this.currentArena = arena;
            this.resetArenaRotation();

            // Teleport all players to new arena
            let players = this.world.creatureHandler.getConnectedPlayers();
            players.forEach(function(p) {
              if(p.isPlayer && p.isPlayer()) {
                let spawn = gameServer.world.warnibia.getRandomSpawn();
                gameServer.world.creatureHandler.teleportCreature(p, spawn);
                p.setFull(CONST.PROPERTIES.HEALTH);
                p.setFull(CONST.PROPERTIES.MANA);
                gameServer.world.warnibia.refillSupplies(p);
                gameServer.world.warnibia.applySpawnProtection(p);
              }
            }, this);

            this.broadcastMessage("[WAR] Arena changed to %s by %s!".format(
              arena.charAt(0).toUpperCase() + arena.slice(1),
              player.getProperty(CONST.PROPERTIES.NAME)
            ));
          }
          return true;
        }
      }

      return true;
    }

    // /leaderboard command
    if(command === "/leaderboard" || command === "/top") {
      let sortBy = "kills";
      if(args.length > 0) {
        if(args[0] === "kd") sortBy = "kd";
        else if(args[0] === "deaths") sortBy = "deaths";
        else if(args[0] === "streak") sortBy = "killStreak";
      }
      this.showLeaderboard(player, sortBy);
      return true;
    }

    // /stats command
    if(command === "/stats") {
      let name = player.getProperty(CONST.PROPERTIES.NAME);
      let stats = this.playerStats.get(name) || { kills: 0, deaths: 0, killStreak: 0 };
      
      player.sendCancelMessage("=== YOUR WAR STATS ===");
      player.sendCancelMessage("Kills: %s".format(stats.kills));
      player.sendCancelMessage("Deaths: %s".format(stats.deaths));
      player.sendCancelMessage("K/D: %s".format(stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills));
      player.sendCancelMessage("Current Kill Streak: %s".format(stats.killStreak));
      return true;
    }

    // /speed command (GM/Admin only)
    if(command === "/speed") {
      if(role >= permissions.ADMIN || role >= permissions.GM) {
        let speed = parseInt(args[0]);
        if(!isNaN(speed) && speed > 0) {
          player.setProperty(CONST.PROPERTIES.SPEED, speed);
          player.sendCancelMessage("Speed set to %s".format(speed));
          return true;
        }
      }
      return true;
    }

    // /broadcast command (GM/Admin only)
    if(command === "/broadcast") {
      if(role >= permissions.ADMIN || role >= permissions.GM) {
        let message = args.join(" ");
        if(message.length > 0) {
          this.broadcastMessage(message);
          return true;
        }
      }
      return true;
    }

    // /pos command
    if(command === "/pos") {
      let pos = player.getPosition();
      player.sendCancelMessage("Position: %s, %s, %s".format(pos.x, pos.y, pos.z));
      return true;
    }

    return false;
  } catch(error) {
    console.error("Command handling failed:", error);
    return false;
  }

};

module.exports = WarSystem;
