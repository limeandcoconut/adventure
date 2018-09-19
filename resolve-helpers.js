const entities = require('./entities')

class ResolveError extends Error {
    constructor(message, code) {
        super(message)
        this.code = code
    }
}

// function entities() {
//     return () => entities.get()
// }
/* eslint-disable require-jsdoc */

function entity() {
    // return action.entity
    return (action) => action.entity
}

function list(getEntity) {
    return (action) => [getEntity(action)]
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
            throw new ResolveError('Action failed to resolve', 'oar1')
        }
        // If there are multiple choices.
        if (set.length > 1) {
            throw new ResolveError('Action has multiple plausible targets', 'oar2')
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
        return entity ? entity.location.parent : undefined
    }
}

function childrenOf(getEntity, accessibleRequired = true, apparentRequired = true) {
    const internalContext = {}
    return (action) => {
        let set
        let result
        if (Array.isArray(action)) {
            set = action
            // result = set.slice()
        } else {
            internalContext.accessibleRequired = action.accessibleRequired
            internalContext.apparentRequired = action.apparentRequired
            set = getEntity(action)
            // console.log(set)
            if (!Array.isArray(set)) {
                set = set ? [set] : []
            }
        }
        // console.log()
        result = []
        // console.log()
        // console.log('s')
        // console.log(set)
        // console.log('s')
        // console.log()
        // console.log()
        // if (entity && entity.container) {
        // console.log(set)
        let {accessibleRequired, apparentRequired} = internalContext
        for (let i = 0; i < set.length; i++) {
            let entity = set[i]
            // console.log(entity)
            // console.log(JSON.stringify(entity, null, 4))
            // console.log(JSON.stringify(entity, null, 4))
            if (entity.container) {
                const isVisible = entity.properties && entity.properties.visible
                // Is the parent visible and either open or transparent.
                // Note: this doesn't check if the child is visible.
                const childApparent = isVisible && (entity.container.open || (entity.properties && entity.properties.transparent))
                // Order matters on the ORs.
                if ((!apparentRequired || childApparent) && (!accessibleRequired || entity.container.open)) {
                    // console.log(result.length)
                    result = [...result, ...entity.container.contents]
                    // console.log(result.length)
                }
            }
            // return set && entity.container ? entity.container.contents.slice() : []
        }
        // console.log()
        // console.log('r')
        // // console.log()
        // console.log(result)
        // // console.log()
        // console.log('r')
        // console.log()

        // if (result.length > 10) {
        //     throw 'sdfsdf'
        // }
        return result
        // }
        // return []
    }
}

function deep(getSet) {
    return (action) => {
        const set = getSet(action)
        let result = set
        let subset = getSet(set)
        while (subset.length) {
            // console.log()
            // console.log()
            // console.log('d')
            // console.log(result.length)
            result = [...result, ...subset]
            // console.log(result.length)
            subset = getSet(subset)
        }
        return result
    }
}

function siblingsOf(getEntity, accessibleRequired = true, apparentRequired = true) {
    return (action) => {
        let siblings = childrenOf(parentOf(getEntity), accessibleRequired, apparentRequired)(action)
        if (siblings.length <= 1) {
            return []
        }
        siblings.splice(siblings.indexOf(getEntity(action)), 1)
        return siblings
    }
}

function deepSiblingsOf(getEntity, accessibleRequired = true, apparentRequired = true) {
    return (action) => {
        let siblings = childrenOf(parentOf(getEntity), accessibleRequired, apparentRequired)(action)
        if (siblings.length <= 1) {
            return []
        }
        siblings.splice(siblings.indexOf(getEntity(action)), 1)
        siblings = [...siblings, ...deep(childrenOf(siblings), accessibleRequired, apparentRequired)]

    }
}

// function not(getSet1(), get)

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
            for (let i = 0; i < exclusions.length; i++) {
                if (exclusions[i].id === item.id) {
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
    siblingsOf,
    deepSiblingsOf,
    deep,
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
