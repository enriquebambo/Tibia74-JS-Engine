module.exports = function utamoVita(source, target) {

  /*
   * function utamoVita
   * Code that handles the utamo vita spell
   */

  let duration = 200;

  source.addCondition(Condition.prototype.MAGIC_SHIELD, duration, 1);

  return 1000;

}
