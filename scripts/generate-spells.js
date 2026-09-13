const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const spellsDir = path.join(projectRoot, 'data/740/spells/definitions');

const SPELL_META = {
  "light": {
    cooldown: 1000,
    effect: (src, dst) => ({
      distance: CONST.EFFECT.PROJECTILE.NONE,
      magic: CONST.EFFECT.MAGIC.MAGIC_GREEN
    }),
    cast(source, target, src) {
      source.increaseHealth(Math.min(1, source.getMaxHealth() - source.getHealth()));
    }
  },
  "light-healing": {
    cooldown: 1000,
    cast(source, target, src) {
      const amount = src.minMax(10, 30);
      source.increaseHealth(amount);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
    }
  },
  "intense-healing": {
    cooldown: 1000,
    cast(source, target, src) {
      const amount = src.minMax(20, 60);
      source.increaseHealth(amount);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
    }
  },
  "ultimate-healing": {
    cooldown: 1000,
    cast(source, target, src) {
      const amount = src.minMax(40, 140);
      source.increaseHealth(amount);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
    }
  },
  "haste": {
    cooldown: 1000,
    cast(source, target, src) {
      source.addCondition(Condition.prototype.HASTE, 20000, 100);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);
    }
  },
  "strong-haste": {
    cooldown: 1000,
    cast(source, target, src) {
      source.addCondition(Condition.prototype.HASTE, 20000, 150);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);
    }
  },
  "magic-shield": {
    cooldown: 1000,
    cast(source, target, src) {
      source.addCondition(Condition.prototype.MAGIC_SHIELD, 200000, 100);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
    }
  },
  "antidote": {
    cooldown: 1000,
    cast(source, target, src) {
      source.removeCondition(Condition.prototype.POISONED);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);
    }
  },
  "magic-rope": {
    cooldown: 1000,
    cast(source, target, src) {
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_YELLOW);
    }
  },
  "energy-strike": {
    cooldown: 2000,
    cast(source, target, src) {
      const damage = src.minMax(20, 40);
      target.decreaseHealth(source, damage, CONST.COLOR.LIGHTBLUE);
      src.distanceEffect(source.position, target.position, CONST.EFFECT.PROJECTILE.ENERGY);
      src.magicEffect(target.position, CONST.EFFECT.MAGIC.ENERGYHIT);
    }
  },
  "flame-strike": {
    cooldown: 2000,
    cast(source, target, src) {
      const damage = src.minMax(30, 50);
      target.decreaseHealth(source, damage, CONST.COLOR.RED);
      src.distanceEffect(source.position, target.position, CONST.EFFECT.PROJECTILE.FIRE);
      src.magicEffect(target.position, CONST.EFFECT.MAGIC.FIREHIT);
    }
  },
  "force-strike": {
    cooldown: 2000,
    cast(source, target, src) {
      const damage = src.minMax(40, 60);
      target.decreaseHealth(source, damage, CONST.COLOR.DARKRED);
      src.distanceEffect(source.position, target.position, CONST.EFFECT.PROJECTILE.LARGE_ROCK);
      src.magicEffect(target.position, CONST.EFFECT.MAGIC.POISON);
    }
  },
  "fire-wave": {
    cooldown: 2000,
    direction: true,
    cast(source, target, src) {
      src.areaWave3(source.position, target.position, (creature) => {
        const damage = src.minMax(30, 50);
        creature.decreaseHealth(source, damage, CONST.COLOR.RED);
        src.magicEffect(creature.position, CONST.EFFECT.MAGIC.FIREHIT);
      });
    }
  },
  "energy-beam": {
    cooldown: 2000,
    direction: true,
    cast(source, target, src) {
      src.areaBeam(source.position, target.position, (creature) => {
        const damage = src.minMax(40, 80);
        creature.decreaseHealth(source, damage, CONST.COLOR.LIGHTBLUE);
        src.magicEffect(creature.position, CONST.EFFECT.MAGIC.ENERGYHIT);
      });
    }
  },
  "great-energy-beam": {
    cooldown: 3000,
    direction: true,
    cast(source, target, src) {
      src.areaBeam(source.position, target.position, (creature) => {
        const damage = src.minMax(80, 120);
        creature.decreaseHealth(source, damage, CONST.COLOR.LIGHTBLUE);
        src.magicEffect(creature.position, CONST.EFFECT.MAGIC.ENERGYHIT);
      });
    }
  },
  "energy-wave": {
    cooldown: 3000,
    direction: true,
    cast(source, target, src) {
      src.areaWave3(source.position, target.position, (creature) => {
        const damage = src.minMax(80, 120);
        creature.decreaseHealth(source, damage, CONST.COLOR.LIGHTBLUE);
        src.magicEffect(creature.position, CONST.EFFECT.MAGIC.ENERGYHIT);
      });
    }
  },
  "ultimate-explosion": {
    cooldown: 4000,
    direction: true,
    cast(source, target, src) {
      src.areaWave3(source.position, target.position, (creature) => {
        const damage = src.minMax(150, 250);
        creature.decreaseHealth(source, damage, CONST.COLOR.LIGHTRED);
        src.magicEffect(creature.position, CONST.EFFECT.MAGIC.EXPLOSION);
      });
    }
  },
  "food": {
    cooldown: 1000,
    cast(source, target, src) {
      source.increaseHealth(Math.min(40, source.getMaxHealth() - source.getHealth()));
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);
    }
  },
  "heal-friend": {
    cooldown: 1000,
    cast(source, target, src) {
      if (target === source) return;
      const amount = src.minMax(20, 60);
      source.increaseHealth(amount);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
    }
  },
  "undead-legion": {
    cooldown: 2000,
    cast(source, target, src) {
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.PURPLEENERGY);
    }
  },
  "mass-healing": {
    cooldown: 3000,
    cast(source, target, src) {
      src.areaWave3(source.position, target.position, (creature) => {
        const amount = src.minMax(20, 60);
        creature.increaseHealth(amount);
        src.magicEffect(creature.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
      });
    }
  },
  "poison-storm": {
    cooldown: 3000,
    cast(source, target, src) {
      src.areaWave3(source.position, target.position, (creature) => {
        const damage = src.minMax(30, 60);
        creature.decreaseHealth(source, damage, CONST.COLOR.GREEN);
        creature.addCondition(Condition.prototype.POISONED, 10000, 10);
        src.magicEffect(creature.position, CONST.EFFECT.MAGIC.GREEN_RINGS);
      });
    }
  },
  "challenge": {
    cooldown: 1000,
    cast(source, target, src) {
      source.sayEmote("challenges %s to a duel!".format(target ? target.getName() : "?"));
    }
  },
  "berserk": {
    cooldown: 2000,
    cast(source, target, src) {
      const damage = src.minMax(40, 70);
      target.decreaseHealth(source, damage, CONST.COLOR.RED);
      src.distanceEffect(source.position, target.position, CONST.EFFECT.PROJECTILE.LARGE_ROCK);
      src.magicEffect(target.position, CONST.EFFECT.MAGIC.BLOCKHIT);
    }
  },
  "invisibility": {
    cooldown: 1000,
    cast(source, target, src) {
      source.addCondition(Condition.prototype.INVISIBLE, 30000, 100);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
    }
  },
  "invisible": {
    cooldown: 1000,
    cast(source, target, src) {
      source.addCondition(Condition.prototype.INVISIBLE, 30000, 100);
      source.sayEmote("fades out.");
    }
  },
  "morph": {
    cooldown: 1000,
    cast(source, target, src) {
      source.addCondition(Condition.prototype.MORPH, 300000, 100);
      source.sayEmote("morphs!");
    }
  },
  "levitate": {
    cooldown: 1000,
    direction: true,
    cast(source, target, src) {
      const dest = source.__getSpellPosition ? source.__getSpellPosition(0, -1) : source.position;
      src.distanceEffect(source.position, dest, CONST.EFFECT.PROJECTILE.NONE);
      src.magicEffect(dest, CONST.EFFECT.MAGIC.MAGIC_BLUE);
    }
  },
  "life-drain": {
    cooldown: 2000,
    cast(source, target, src) {
      if (!source.hasTarget || !source.hasTarget(target)) return 0;
      const damage = src.minMax(20, 40);
      target.decreaseHealth(source, damage, CONST.COLOR.DARKRED);
      const healed = Math.floor(damage / 2);
      source.increaseHealth(healed);
      src.distanceEffect(source.position, target.position, CONST.EFFECT.PROJECTILE.SMALL_PLANT);
      src.magicEffect(target.position, CONST.EFFECT.MAGIC.REDSHOCK);
    }
  },
  "utani-hur": {
    cooldown: 1000,
    cast(source, target, src) {
      source.addCondition(Condition.prototype.HASTE, 10000, 150);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);
    }
  },
  "utani-gran-hur": {
    cooldown: 1000,
    cast(source, target, src) {
      source.addCondition(Condition.prototype.HASTE, 10000, 250);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_GREEN);
    }
  },
  "utamo-vita": {
    cooldown: 1000,
    cast(source, target, src) {
      source.addCondition(Condition.prototype.MAGIC_SHIELD, 60000, 100);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
    }
  },
  "exura-gran": {
    cooldown: 1000,
    cast(source, target, src) {
      const amount = src.minMax(60, 120);
      source.increaseHealth(amount);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
    }
  },
  "exura-vita": {
    cooldown: 2000,
    cast(source, target, src) {
      const amount = src.minMax(120, 240);
      source.increaseHealth(amount);
      src.magicEffect(source.position, CONST.EFFECT.MAGIC.MAGIC_BLUE);
    }
  },
  "exori": {
    cooldown: 2000,
    cast(source, target, src) {
      const damage = src.minMax(40, 80);
      target.decreaseHealth(source, damage, CONST.COLOR.RED);
      src.distanceEffect(source.position, target.position, CONST.EFFECT.PROJECTILE.LARGE_ROCK);
      src.magicEffect(target.position, CONST.EFFECT.MAGIC.BLOCKHIT);
    }
  }
};

const COUNT = {
  light: 100,
  haste: 100,
  magic_rope: 1000,
  challenge: 1000,
  invisible: 0,
  morph: 100
};

function getCount(name) {
  return COUNT[name] || 1000;
}

function writeFile(name, content) {
  const filePath = path.join(spellsDir, name);
  fs.writeFileSync(filePath, content.trim() + '\n');
}

const existing = fs.readdirSync(spellsDir).filter(f => f.endsWith('.js') && f !== 'definitions.json');

for (const file of existing) {
  const name = file.replace('.js', '');
  const meta = SPELL_META[name];
  if (!meta) {
    console.log('Skip unknown spell:', name);
    continue;
  }

  const src = {
    minMax(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    magicEffect(position, type) {
      if (process.gameServer && process.gameServer.world) {
        process.gameServer.world.sendMagicEffect(position, type);
      }
    },
    distanceEffect(from, to, type) {
      if (process.gameServer && process.gameServer.world) {
        process.gameServer.world.sendDistanceEffect(from, to, type);
      }
    },
    areaWave3(from, to, fn) {
      if (!from || !to) return;
      const positions = require(path.join(projectRoot, 'src/systems/formulas.js')).getAreaPositions('wave3', 1);
      const baseX = from.x;
      const baseY = from.y;
      const dirX = Math.sign(to.x - from.x) || 0;
      const dirY = Math.sign(to.y - from.y) || 0;
      positions.forEach(([dx, dy]) => {
        const x = baseX + dx * dirX;
        const y = baseY + dy * dirY;
        if (process.gameServer && process.gameServer.world) {
          const tile = process.gameServer.world.getTileFromWorldPosition && process.gameServer.world.getTileFromWorldPosition({ x, y, z: from.z });
          if (tile && tile.creatures) {
            tile.creatures.forEach(creature => {
              if (creature && creature.isPlayer && creature.isPlayer() === false) {
                fn(creature);
              }
            });
          }
        }
      });
    },
    areaBeam(from, to, fn) {
      if (!from || !to) return;
      const positions = require(path.join(projectRoot, 'src/systems/formulas.js')).getAreaPositions('beam5', 1);
      const baseX = from.x;
      const baseY = from.y;
      const dirX = Math.sign(to.x - from.x) || 0;
      const dirY = Math.sign(to.y - from.y) || 0;
      positions.forEach(([dx, dy]) => {
        const x = baseX + dx * dirX;
        const y = baseY + dy * dirY;
        if (process.gameServer && process.gameServer.world) {
          const tile = process.gameServer.world.getTileFromWorldPosition && process.gameServer.world.getTileFromWorldPosition({ x, y, z: from.z });
          if (tile && tile.creatures) {
            tile.creatures.forEach(creature => {
              if (creature && creature.isPlayer && creature.isPlayer() === false) {
                fn(creature);
              }
            });
          }
        }
      });
    }
  };

  const effectBlock = meta.effect ? `
  let effect = %s;
  process.gameServer.world.sendDistanceEffect(source.position, target.position, effect.distance);
  process.gameServer.world.sendMagicEffect(target.position, effect.magic);\n` : '';

  const body = meta.direction
    ? `let target = source.getTarget ? source.getTarget() : target;\n    if (!target) return 0;\n    %smeta.cast(source, target, src);`
    : `%smeta.cast(source, target, src);`;

  const content = `
module.exports = function ${name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}(source, target) {
  const src = {
    minMax(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    magicEffect(position, type) {
      if (process.gameServer && process.gameServer.world) {
        process.gameServer.world.sendMagicEffect(position, type);
      }
    },
    distanceEffect(from, to, type) {
      if (process.gameServer && process.gameServer.world) {
        process.gameServer.world.sendDistanceEffect(from, to, type);
      }
    }
  };

  ${effectBlock.trim().replace(/%s/g, `source.getLevel ? source.getLevel() : 40`) || ''}
  ${body.trim().replace(/%s/g, '')}

  return ${getCount(name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())};
};
`;

  writeFile(name + '.js', content);
  console.log('Wrote', name);
}
