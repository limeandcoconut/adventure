const list = Symbol('Private key for entity list.')
const search = require('searchjs').matchArray

module.exports = {
  [list]: [],
  store(entity) {
    this[list].push(entity)
    return this
  },
  get(query) {
    if (!query) {
      return this[list]
    }
    return search(this[list], query)
  },
  clear() {
    this[list] = []
  },
}
