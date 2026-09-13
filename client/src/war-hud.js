const WarHud = function() {

  /*
   * Class WarHud
   * Lightweight war HUD updater
   */

  this.arenaElement = document.getElementById("war-hud-arena");
  this.rotationElement = document.getElementById("war-hud-rotation");
  this.protectionElement = document.getElementById("war-hud-protection");
  this.killsElement = document.getElementById("war-hud-kills");
  this.deathsElement = document.getElementById("war-hud-deaths");
  this.streakElement = document.getElementById("war-hud-streak");

  this.state = {
    arena: "-",
    rotationSeconds: 0,
    protection: false,
    kills: 0,
    deaths: 0,
    streak: 0
  };

};

WarHud.prototype.updateArena = function(arena, rotationSeconds) {

  /*
   * Function WarHud.updateArena
   * Updates the arena and rotation display
   */

  this.state.arena = arena || "-";
  this.state.rotationSeconds = rotationSeconds || 0;

  if(this.arenaElement) {
    this.arenaElement.innerHTML = this.state.arena;
  }

  if(this.rotationElement) {
    let minutes = Math.floor(this.state.rotationSeconds / 60);
    let seconds = this.state.rotationSeconds % 60;
    this.rotationElement.innerHTML = "%s:%s".format(String(minutes).padStart(2, "0"), String(seconds).padStart(2, "0"));
  }

};

WarHud.prototype.setProtection = function(active, seconds) {

  /*
   * Function WarHud.setProtection
   * Updates the spawn protection display
   */

  this.state.protection = active;

  if(this.protectionElement) {
    if(active) {
      this.protectionElement.innerHTML = "%ss".format(seconds || 0);
      this.protectionElement.style.color = "rgb(0, 255, 0)";
    } else {
      this.protectionElement.innerHTML = "No";
      this.protectionElement.style.color = "rgb(255, 0, 0)";
    }
  }

};

WarHud.prototype.setStats = function(kills, deaths, streak) {

  /*
   * Function WarHud.setStats
   * Updates the war stats display
   */

  this.state.kills = kills || 0;
  this.state.deaths = deaths || 0;
  this.state.streak = streak || 0;

  if(this.killsElement) {
    this.killsElement.innerHTML = this.state.kills;
  }

  if(this.deathsElement) {
    this.deathsElement.innerHTML = this.state.deaths;
  }

  if(this.streakElement) {
    this.streakElement.innerHTML = this.state.streak;
  }

};

WarHud.prototype.parseServerMessage = function(message) {

  /*
   * Function WarHud.parseServerMessage
   * Parses server messages for war data
   */

  if(typeof message !== "string") {
    return;
  }

  // Parse arena rotation messages
  let arenaMatch = message.match(/Rotating arena from (\w+) to (\w+)/);
  if(arenaMatch) {
    this.updateArena(arenaMatch[2], 0);
    return;
  }

  // Parse arena change messages
  let changeMatch = message.match(/Arena changed to (\w+)/);
  if(changeMatch) {
    this.updateArena(changeMatch[1], 0);
    return;
  }

  // Parse welcome messages
  let welcomeMatch = message.match(/Welcome to (\w+)!/);
  if(welcomeMatch) {
    this.updateArena(welcomeMatch[1], 0);
    return;
  }

  // Parse spawn protection messages
  let protectionMatch = message.match(/You are protected for (\d+) seconds/);
  if(protectionMatch) {
    this.setProtection(true, protectionMatch[1]);
    return;
  }

  // Parse protection end messages
  if(message.indexOf("protection") !== -1 && message.indexOf("ended") !== -1) {
    this.setProtection(false, 0);
    return;
  }

  // Parse kill messages
  let killMatch = message.match(/\[(.+)\] was slain by \[(.+)\]/);
  if(killMatch) {
    let victim = killMatch[1];
    let killer = killMatch[2];

    if(gameClient.player && killer === gameClient.player.name) {
      this.state.kills++;
      this.state.streak++;
      this.setStats(this.state.kills, this.state.deaths, this.state.streak);
    }

    if(gameClient.player && victim === gameClient.player.name) {
      this.state.deaths++;
      this.state.streak = 0;
      this.setStats(this.state.kills, this.state.deaths, this.state.streak);
      this.setProtection(false, 0);
    }
  }

};

module.exports = WarHud;
