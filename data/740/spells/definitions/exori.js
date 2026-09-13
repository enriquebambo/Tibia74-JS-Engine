module.exports = function exori(source, target) {

  /*
   * function exori
   * Code that handles the exori spell
   */

  let minDamage = 10;
  let maxDamage = 30;
  let damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

  target.decreaseHealth(source, damage);

  return 1000;

}
