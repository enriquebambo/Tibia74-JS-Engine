const Position = requireModule("position");

module.exports = function wildGrowth(source, target) {

  /*
   * function wildGrowth
   * Code that handles the wild growth rune
   */

  // Cannot place on occupied tiles
  if(target.isOccupiedAny()) {
    return false;
  }

  // Cannot place over existing blocking items
  if(target.hasItems() && target.itemStack.isBlockSolid()) {
    return false;
  }

  // Create wild growth/bush item - using a tree/bush item ID
  let bush = process.gameServer.database.createThing(2782);
  target.addItem(bush);

  // Send effect
  process.gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);

  // Schedule removal after 45 seconds
  gameServer.world.eventQueue.addEventSeconds(function() {
    if(target.hasItems()) {
      target.removeItem(bush);
      process.gameServer.world.sendMagicEffect(target.position, CONST.EFFECT.MAGIC.POFF);
    }
  }, 45);

  return true;

}
