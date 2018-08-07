/**
 * A module for creating a logical process that updates on each tick.
 * @module Process
 */

const AbstractConstructError = require('abstract-class-error').default

/**
 * Class for creating a logical process that updates on each tick.
 * @abstract
 */
// * @class Process
module.exports = class Process {

    /**
     * @constructor
     * @throws {AbstractConstructError}      Throws (Error in es2015) if Process class is the target of the new operator as
     *                                       this class is abstract.
     * @throws {AbstractConstructError}      Throws (Error in es2015) if update is not overridden by the user.
     */
    constructor() {
        if (new.target === Process) {
            throw new AbstractConstructError('Cannot construct class Process instances directly')
        }

        if (this.update === Process.prototype.update) {
            throw new AbstractConstructError('Method "update" must be overridden in class "Process"')
        }
    }

    /**
     * Perform logic each tick.
     * @method update
     * @abstract
     */
    update() {}
}
