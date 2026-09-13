const Position = requireModule("position");

module.exports = function suddenDeath(source, target) {

  /*
   * function suddenDeath
   * Code that handles the sudden death rune
   */

  process.gameServer.world.sendDistanceEffect(source.position, target.position, CONST.EFFECT.PROJECTILE.DEATH);
  process.gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.MORTAREA);

  // Calculate damage based on level and magic level
  let level = source.skills.getSkillLevel(CONST.PROPERTIES.EXPERIENCE);
  let magicLevel = source.getLevel();
  let damage = Math.floor((level * 0.5) + (magicLevel * 2.0));
  damage = Math.max(100, Math.min(600, damage));

  // Damage all players/monsters on the tile
  target.players.forEach(function(player) {
    player.decreaseHealth(source, damage);
  });

  target.monsters.forEach(function(monster) {
    monster.decreaseHealth(source, damage);
  });

  return true;

}
