module.exports = function levitate(properties) {

  let facePosition = this.getFacePosition();
  let faceTile = process.process.gameServer.world.getTileFromWorldPosition(facePosition);

  if(faceTile === null) {

    let downTile = process.process.gameServer.world.getTileFromWorldPosition(facePosition.down());
    
    if(downTile !== null && downTile.id !== 0 && !this.isTileOccupied(downTile)) {
      process.process.gameServer.world.sendMagicEffect(downTile.position, CONST.EFFECT.MAGIC.TELEPORT);
      process.process.gameServer.world.teleportCreature(this, downTile.position);
      return 1000;
    }

  }

  let directUpTile = process.process.gameServer.world.getTileFromWorldPosition(this.position.up());

  if(directUpTile === null) {

    let upTile = process.process.gameServer.world.getTileFromWorldPosition(facePosition.up());
    
    if(upTile !== null && upTile.id !== 0 && !this.isTileOccupied(upTile)) {
      process.process.gameServer.world.sendMagicEffect(upTile.position, CONST.EFFECT.MAGIC.TELEPORT);
      process.process.gameServer.world.teleportCreature(this, upTile.position);
      return 100;
    }
  }

  return 0;

}