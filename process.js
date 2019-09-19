/**
 * A module for creating a logical process that updates on each tick.
 * @module Process
 *

/**
 * Class for creating a logical process that updates on each tick.
 * @abstract
 */
// * @class Process
module.exports = class Process {

  /**
     * @constructor
     * @throws {Error}      Throws Error if Process class is the target of the new operator as this class is abstract.
     * @throws {Error}      Throws Error if update is not overridden by the user.
     */
  constructor() {
    if (new.target === Process) {
      throw new Error('Cannot construct class Process instances directly')
    }

    if (this.update === Process.prototype.update) {
      throw new Error('Method "update" must be overridden in class "Process"')
    }
  }

  /**
     * Perform logic each tick.
     * @method update
     * @abstract
     */
  update() {}
}
