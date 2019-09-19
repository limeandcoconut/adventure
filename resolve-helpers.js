const entities = require('./entities')

class ResolveError extends Error {
  constructor(message, code, meta) {
    super(message)
    this.code = code
    this.meta = meta
  }
}

// function entities() {
//     return () => entities.get()
// }
/* eslint-disable require-jsdoc, complexity, max-depth */

function entity() {
  // return action.entity
  return (action) => {
    action.accessible[action.entity.id] = true
    return action.entity
  }
}

function list(getEntity) {
  return action => [getEntity(action)]
}

function either(getSet1, getSet2) {
  return (action) => {
    let set1 = getSet1(action)
    if (!Array.isArray(set1)) {
      set1 = set1 ? [set1] : []
    }
    return set1.concat(getSet2(action))
  }
}

function onlyOne(getSet) {
  return (action) => {
    const set = getSet(action)
    if (!set || set.length === 0) {
      // Twin to aor5 without necessarily having a noun.
      throw new ResolveError('Action failed to resolve', 'oar1')
    }
    // If there are multiple choices.
    if (set.length > 1) {
      throw new ResolveError(`Resolved multiple unspecified objects`, 'aor6', {candidates: set})
    }

    return set[0]
  }
}

function firstOne(getSet) {
  return (action) => {
    const set = getSet(action)
    if (!set || set.length === 0) {
      throw new ResolveError('Action failed to resolve', 'oar1')
    }
    if (set.length) {
      return set[0]
    }
    return set
  }
}

function parentOf(getSet) {
  return (action) => {
    const entity = getSet(action)
    if (!entity) {
      return undefined
    }
    const parent = entity.location.parent
    action.accessible[parent.id] = true
    return parent
  }
}

// function contentsOf(getEntity) {
//
//     return (action) => {
//         let set
//         let result
//         if (Array.isArray(action)) {
//             set = action
//         } else {
//             internalContext.accessibleRequired = action.accessibleRequired
//             internalContext.apparentRequired = action.apparentRequired
//             set = getEntity(action)
//             if (!Array.isArray(set)) {
//                 set = set ? [set] : []
//             }
//         }

//         result = []

//         let {accessibleRequired, apparentRequired} = action
//         for (let i = 0; i < set.length; i++) {
//             let entity = set[i]
//             if (entity.container) {
//                 const isVisible = entity.properties && entity.properties.visible
//                 const childApparent = isVisible && (entity.container.open || (entity.properties && entity.properties.transparent))
//                 // Order matters on the ORs.
//                 if ((!apparentRequired || childApparent) && (!accessibleRequired || entity.container.open)) {
//                     result = [...result, ...entity.container.contents]
//                 }
//             }
//         }
//         return result
//     }
// }

function childrenOf(getEntity) {
  return (action) => {
    let set = getEntity(action)
    if (!Array.isArray(set)) {
      set = set ? [set] : []
    }

    let result = []
    const childrenInaccessible = {}

    let {apparentRequired} = action
    for (const entity of set) {

      if (entity.container) {

        childrenInaccessible[entity.id] = !action.accessible[entity.id] || !entity.container.open

        const isVisible = entity.properties && entity.properties.visible
        const isTransparent = entity.properties && entity.properties.transparent
        const childApparent = isVisible && (entity.container.open || isTransparent)

        // Order matters on the ORs.
        if (!apparentRequired || childApparent) {
          result = [...result, ...entity.container.contents, ...entity.container.fixtures]
        }
      }
    }

    for (const entity of result) {
      action.accessible[entity.id] = !childrenInaccessible[entity.location.parent.id]
    }

    return result
  }
}

function deepChildrenOf(getEntity) {
  return (action) => {
    let {apparentRequired} = action
    let set = getEntity(action)
    if (!Array.isArray(set)) {
      set = set ? [set] : []
    }

    let result = []
    let subset = set
    let subResult
    const childrenInaccessible = {}

    do {
      if (subResult) {
        result = [...result, ...subResult]
      }
      subResult = []

      for (const entity of subset) {

        if (result.length) {
          action.accessible[entity.id] = !childrenInaccessible[entity.location.parent.id]
        }

        if (entity.container) {
          childrenInaccessible[entity.id] = !action.accessible[entity.id] || !entity.container.open

          const isVisible = entity.properties && entity.properties.visible
          const isTransparent = entity.properties && entity.properties.transparent
          const childApparent = isVisible && (entity.container.open || isTransparent)

          // Order matters on the ORs.
          if (!apparentRequired || childApparent) {
            subResult = [...subResult, ...entity.container.contents, ...entity.container.fixtures]
          }
        }
      }

      subset = subResult
    } while (subset.length)

    return result
  }
}

function constituentsOf(getEntity) {
  return (action) => {
    let set = getEntity(action)
    if (!Array.isArray(set)) {
      set = set ? [set] : []
    }

    let result = []

    let {apparentRequired} = action
    for (const entity of set) {
      const isVisible = entity.properties && entity.properties.visible
      if (entity.container) {
        const isTransparent = entity.properties && entity.properties.transparent
        const childApparent = isVisible && (entity.container.open || isTransparent)
        // Order matters on the ORs.
        if (!apparentRequired || childApparent) {
          result = [...result, ...entity.container.contents, ...entity.container.fixtures]
        }
      }
      if (entity.multipart) {
        if ((!apparentRequired || isVisible)) {
          result = [...result, ...entity.multipart.parts]
        }
      }
    }

    for (const entity of result) {
      const parent = entity.location.parent
      action.accessible[entity.id] = action.accessible[parent.id] &&
      (
        (entity.properties && entity.properties.part) ||
        (parent.container && parent.container.open)
      )
    }

    return result
  }
}

function deepConstituentsOf(getEntity) {
  return (action) => {
    let {apparentRequired} = action
    let set = getEntity(action)
    if (!Array.isArray(set)) {
      set = set ? [set] : []
    }

    let result = []
    let subset = set
    let subResult

    do {
      if (subResult) {
        result = [...result, ...subResult]
      }
      subResult = []

      for (const entity of subset) {
        const isVisible = entity.properties && entity.properties.visible

        if (result.length) {
          const parent = entity.location.parent
          action.accessible[entity.id] = action.accessible[parent.id] &&
          (
            (entity.properties && entity.properties.part) ||
            (parent.container && parent.container.open)
          )
        }

        if (entity.container) {
          const isTransparent = entity.properties && entity.properties.transparent
          const childApparent = isVisible && (entity.container.open || isTransparent)
          // Order matters on the ORs.
          if (!apparentRequired || childApparent) {
            subResult = [...subResult, ...entity.container.contents, ...entity.container.fixtures]
          }
        }
        if (entity.multipart) {
          if ((!apparentRequired || isVisible)) {
            subResult = [...subResult, ...entity.multipart.parts]
          }
        }
      }

      subset = subResult
    } while (subset.length)

    return result
  }
}

function contentsOf(getEntity) {
  return (action) => {
    let set = getEntity(action)
    if (!Array.isArray(set)) {
      set = set ? [set] : []
    }

    let result = []
    const childrenInaccessible = {}

    let {apparentRequired} = action
    for (const entity of set) {
      if (entity.container) {
        childrenInaccessible[entity.id] = !action.accessible[entity.id] || !entity.container.open

        const isVisible = entity.properties && entity.properties.visible
        const isTransparent = entity.properties && entity.properties.transparent
        const childApparent = isVisible && (entity.container.open || isTransparent)
        // Order matters on the ORs.
        if ((!apparentRequired || childApparent)) {
          result = [...result, ...entity.container.contents]
        }
      }
    }

    for (const entity of result) {
      action.accessible[entity.id] = !childrenInaccessible[entity.location.parent.id]
    }

    return result
  }
}

function deepContentsOf(getEntity) {
  return (action) => {
    let {apparentRequired} = action
    let set = getEntity(action)
    if (!Array.isArray(set)) {
      set = set ? [set] : []
    }

    let result = []
    let subset = set
    let subResult
    const childrenInaccessible = {}

    do {
      if (subResult) {
        result = [...result, ...subResult]
      }
      subResult = []

      for (const entity of subset) {

        if (result.length) {
          action.accessible[entity.id] = !childrenInaccessible[entity.location.parent.id]
        }

        if (entity.container) {
          childrenInaccessible[entity.id] = !action.accessible[entity.id] || !entity.container.open

          const isVisible = entity.properties && entity.properties.visible
          const isTransparent = entity.properties && entity.properties.transparent
          const childApparent = isVisible && (entity.container.open || isTransparent)
          // Order matters on the ORs.
          if (!apparentRequired || childApparent) {
            subResult = [...subResult, ...entity.container.contents]
          }
        }
      }

      subset = subResult
    } while (subset.length)

    return result
  }
}

function deep(getSet) {
  return (action) => {
    const set = getSet(action)
    let result = set
    let subset = getSet(set)
    while (subset.length) {
      result = [...result, ...subset]
      subset = getSet(subset)
    }
    return result
  }
}

function siblingsOf(getEntity, broad = false) {
  const getSet = broad ? childrenOf : constituentsOf
  return (action) => {
    let siblings = getSet(parentOf(getEntity))(action)
    if (siblings.length <= 1) {
      return []
    }
    siblings.splice(siblings.indexOf(getEntity(action)), 1)
    return siblings
  }
}

function deepSiblingsOf(getEntity, broad = false) {
  const getSet = broad ? childrenOf : constituentsOf
  return (action) => {
    let siblings = getSet(parentOf(getEntity))(action)
    if (siblings.length <= 1) {
      return []
    }
    siblings.splice(siblings.indexOf(getEntity(action)), 1)
    siblings = [...siblings, ...deep(getSet(siblings))]

  }
}

function tool(type, getSet) {
  return (action) => {
    const set = getSet(action)

    if (!Array.isArray(set)) {
      return set.tool && set.tool.type === type ? set : undefined
    }

    const result = []
    while (set.length) {
      let entity = set.shift()
      if (entity.tool && entity.tool.type === type) {
        result.push(entity)
      }
    }
    return result
  }
}

function legible(getSet) {
  return (action) => {
    const set = getSet(action)

    if (!Array.isArray(set)) {
      return set.text ? set : undefined
    }

    const result = []
    while (set.length) {
      let entity = set.shift()
      if (entity.text) {
        result.push(entity)
      }
    }
    return result
  }
}

function visible(getSet) {
  return (action) => {
    const set = getSet(action)

    if (!Array.isArray(set)) {
      return (set.properties && set.properties.visible) ? set : undefined
    }

    const result = []
    while (set.length) {
      let entity = set.shift()
      if (entity.properties && entity.properties.visible) {
        result.push(entity)
      }
    }
    return result
  }
}

function appropriate(getSet) {
  return (action) => {
    const set = getSet(action)
    const {apparentRequired} = action

    if (!Array.isArray(set)) {
      return !apparentRequired || (set.properties && set.properties.visible) ? set : undefined
    }

    const result = []
    while (set.length) {
      let entity = set.shift()
      if (!apparentRequired || (entity.properties && entity.properties.visible)) {
        result.push(entity)
      }
    }
    return result
  }
}

function exclude(getExclusions, getSet) {
  return (action) => {
    let set = getSet(action)
    let exclusions = getExclusions(action)
    if (!Array.isArray(exclusions)) {
      exclusions = [exclusions]
    }
    if (!Array.isArray(set)) {
      // if (!Array.isArray(exclusions)) {
      //     return set.id !== exclusions.id ? set : null
      // }
      set = set ? [set] : []
      while (exclusions.length) {
        if (exclusions.shift().id === set.id) {
          return undefined
        }
      }
      return set
    }

    const result = []
    while (set.length) {
      let found
      const item = set.shift()
      for (const exclusion of exclusions) {
        if (exclusion.id === item.id) {
          found = true
          break
        }
      }
      if (!found) {
        result.push(item)
      }
    }
    return result
  }
}

module.exports = {
  entities,
  entity,
  parentOf,
  childrenOf,
  contentsOf,
  constituentsOf,
  deepChildrenOf,
  deepContentsOf,
  deepConstituentsOf,
  siblingsOf,
  deepSiblingsOf,
  // deep,
  visible,
  tool,
  legible,
  list,
  onlyOne,
  firstOne,
  either,
  ResolveError,
  exclude,
  appropriate,
}
