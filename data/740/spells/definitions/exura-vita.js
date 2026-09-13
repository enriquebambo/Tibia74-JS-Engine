module.exports = function exuraVita(source, target) {

  /*
   * function exuraVita
   * Code that handles the exura vita spell
   */

  let minHealing = 250;
  let maxHealing = 450;
  let healing = Math.floor(Math.random() * (maxHealing - minHealing + 1)) + minHealing;

  target.increaseHealth(healing);
  return 1000;

}
