const Condition = requireModule("condition");

module.exports = function exuraGran(source, target) {

  /*
   * function exuraGran
   * Code that handles the exura gran spell
   */

  let minHealing = 90;
  let maxHealing = 150;
  let healing = Math.floor(Math.random() * (maxHealing - minHealing + 1)) + minHealing;

  target.increaseHealth(healing);
  return 1000;

}
