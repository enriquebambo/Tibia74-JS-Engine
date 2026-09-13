const Formulas = function() {

  /*

   * Class Formulas
   * Canonical Tibia spell/rune formulae from server data
   *
   * API:
   * healingFormula(level, maglevel, base, variation, value_min, value_max)
   * damageFormula(level, maglevel, base, variation)
   * computeFormula(level, maglevel, base, variation)
   * getAreaPositions(areaName, direction)
   *
   */

};

Formulas.healingFormula = function(level, maglevel, base, variation, value_min, value_max) {

  let value = 3 * maglevel + (2 * level);

  if(typeof value_min === "number" && value < value_min) {
    value = value_min;
  }

  if(typeof value_max === "number" && value > value_max) {
    value = value_max;
  }

  let min = value * (base - variation) / 100;
  let max = value * (base + variation) / 100;

  return { min: Math.floor(min), max: Math.floor(max) };

};

Formulas.damageFormula = function(level, maglevel, base, variation) {

  let value = 3 * maglevel + (2 * level);

  let min = value * (base - variation) / 100;
  let max = value * (base + variation) / 100;

  return { min: Math.floor(min), max: Math.floor(max) };

};

Formulas.computeFormula = function(level, maglevel, base, variation) {

  let damage = base;
  if(variation > 0) {
    damage += Math.floor(Math.random() * (variation * 2 + 1)) - variation;
  }

  let level_formula = 2 * level;
  let magic_formula = 3 * maglevel + level_formula;

  return Math.floor(magic_formula * damage / 100);

};

// Canonical area matrices from spells.lua
Formulas.AREAS = {
  wave3: [[1,1,1],[1,1,1],[0,3,0]],
  wave4: [[1,1,1,1,1],[0,1,1,1,0],[0,1,1,1,0],[0,0,3,0,0]],
  wave6: [[0,0,0,0,0],[0,1,3,1,0],[0,0,0,0,0]],
  squareWave5: [[1,1,1],[1,1,1],[1,1,1],[0,1,0],[0,3,0]],
  squareWave6: [[0,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,0],[0,0,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,0,0],[0,0,0,1,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,1,0,0,0],[0,0,0,0,1,1,1,0,0,0,0],[0,0,0,0,1,1,1,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0]],
  squareWave7: [[0,0,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,0,0],[0,0,0,1,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,1,0,0,0],[0,0,0,0,1,1,1,0,0,0,0],[0,0,0,0,1,1,1,0,0,0,0],[0,0,0,0,1,1,1,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,3,0,0,0,0,0]],
  diagonalWave4: [[0,0,0,0,1,0],[0,0,0,1,1,0],[0,0,1,1,1,0],[0,1,1,1,1,0],[1,1,1,1,1,0],[0,0,0,0,0,3]],
  diagonalSquareWave5: [[1,1,1,0,0],[1,1,1,0,0],[1,1,1,0,0],[0,0,0,1,0],[0,0,0,0,3]],
  diagonalWave6: [[0,0,1],[0,3,0],[1,0,0]],
  beam1: [[3]],
  beam5: [[1],[1],[1],[1],[3]],
  beam7: [[1],[1],[1],[1],[1],[1],[3]],
  beam8: [[1],[1],[1],[1],[1],[1],[1],[3]],
  diagonalBeam5: [[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,3]],
  diagonalBeam7: [[1,0,0,0,0,0,0],[0,1,0,0,0,0,0],[0,0,1,0,0,0,0],[0,0,0,1,0,0,0],[0,0,0,0,1,0,0],[0,0,0,0,0,1,0],[0,0,0,0,0,0,3]],
  circle2x2: [[0,1,1,1,0],[1,1,1,1,1],[1,1,3,1,1],[1,1,1,1,1],[0,1,1,1,0]],
  circle3x3: [[0,0,1,1,1,0,0],[0,1,1,1,1,1,0],[1,1,1,1,1,1,1],[1,1,1,3,1,1,1],[1,1,1,1,1,1,1],[0,1,1,1,1,1,0],[0,0,1,1,1,0,0]],
  cross1x1: [[0,1,0],[1,3,1],[0,1,0]],
  circle5x5: [[0,0,0,0,0,1,0,0,0,0,0],[0,0,0,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,0],[1,1,1,1,1,3,1,1,1,1,1],[0,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,0],[0,0,1,1,1,1,1,1,1,0,0],[0,0,0,1,1,1,1,1,0,0,0],[0,0,0,0,0,1,0,0,0,0,0]],
  square1x1: [[1,1,1],[1,3,1],[1,1,1]],
  wallField: [[1,1,3,1,1]],
  diagonalWallField: [[0,0,0,0,1],[0,0,0,1,1],[0,1,3,1,0],[1,1,0,0,0],[1,0,0,0,0]]
};

Formulas.getAreaPositions = function(areaName, direction) {
  const area = this.AREAS[areaName];
  if(!area || !Array.isArray(area)) {
    return [];
  }

  const positions = [];
  const rows = area.length;
  const cols = area[0] ? area[0].length : 0;
  const midRow = Math.floor(rows / 2);
  const midCol = Math.floor(cols / 2);

  for(let r = 0; r < rows; r++) {
    for(let c = 0; c < cols; c++) {
      const relX = c - midCol;
      const relY = r - midRow;

      let rotatedX = relX;
      let rotatedY = relY;

      if(direction === 1) { // north
        rotatedX = -relX;
        rotatedY = -relY;
      } else if(direction === 2) { // east
        rotatedX = relY;
        rotatedY = -relX;
      } else if(direction === 3) { // south
        rotatedX = relX;
        rotatedY = relY;
      } else if(direction === 4) { // west
        rotatedX = -relY;
        rotatedY = relX;
      } else if(direction === 5) { // north-east
        rotatedX = -relX + relY;
        rotatedY = -relY - relX;
      } else if(direction === 6) { // south-east
        rotatedX = relX + relY;
        rotatedY = relY - relX;
      } else if(direction === 7) { // south-west
        rotatedX = relX - relY;
        rotatedY = relY + relX;
      } else if(direction === 8) { // north-west
        rotatedX = -relX - relY;
        rotatedY = -relY + relX;
      }

      positions.push({
        x: rotatedX,
        y: rotatedY,
        isOrigin: area[r][c] === 3
      });
    }
  }

  return positions;
};

module.exports = Formulas;
