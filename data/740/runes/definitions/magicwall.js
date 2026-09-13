const Position = requireModule("position");

module.exports = function magicWall(source, target) {

  /*
   * function magicWall
   * Code that handles the magic wall rune
   */

  // Cannot place on occupied tiles
  if(target.isOccupiedAny()) {
    return false;
  }

  // Cannot place over existing blocking items
  if(target.hasItems() && target.itemStack.isBlockSolid()) {
    return false;
  }

  // Create magic wall item
  let wall = process.gameServer.database.createThing(2293);
  target.addItem(wall);

  // Send effect
  process.gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);

  // Schedule removal after 20 seconds
  gameServer.world.eventQueue.addEventSeconds(function() {
    if(target.hasItems()) {
      target.removeItem(wall);
      process.gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.POFF);
    }
  }, 20);

  return true;

}
