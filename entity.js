/* eslint-env es6 */
// TODO: [>=0.1.0] this doc
/**
 * A module for creating logical systems that run on each tick of the Rubric engine.
 * @module Entity
 */

// const AbstractConstructError = require('abstract-class-error').default

/**
 * Class for creating logical system that update on each tick of the Rubric engine.
 * @abstract
 */
// * @class System
module.exports = class Entity {
  /**
   * Prevents circular json.
   * @method toString
   * @return {string} A string descrption of the entity
   */
  toString() {
    const tab = '    '
    let string = `Entity {\n${tab}id: ${this.id},\n${tab}name: "${this.descriptors.name}",\n${tab}parent: ${this.location.parent && this.location.parent.id},\n`
    if (this.container) {
      let contents = this.container.contents.reduce((string, entity) => string + `{id: ${entity.id}, name: "${entity.descriptors.name}"}, `, '')
      string += `\n${tab}contents:${contents},\n`
    }
    string += '}'
    return string
  }
}
