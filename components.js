class Descriptors {
    constructor(labels, descriptors = [], name) {
        if (!Array.isArray(descriptors)) {
            throw new TypeError('Descriptors must be an Array')
        }
        this.descriptors = descriptors
        if (!Array.isArray(labels)) {
            throw new TypeError('Labels must be an Array')
        }
        if (!labels.length) {
            throw new RangeError('Labels cannot be empty')
        }
        this.labels = labels
        this.name = name || labels[0]
    }

}

class Option {
    constructor(value = false) {
        this.value = value
    }
}

class Appearance {
    constructor(appearance) {
        if (typeof appearance !== 'undefined' && typeof appearance !== 'string' && appearance !== null) {
            throw new TypeError('Argument "appearance" must be a string or null')
        }
        this.appearance = appearance
    }
}

class Text {
    constructor(text) {
        if (typeof text !== 'undefined' && typeof text !== 'string' && text !== null) {
            throw new TypeError('Argument "text" must be a string or null')
        }
        this.text = text
    }
}

class Area {
    constructor(title, visited = [], doors = {}) {

        if (!Array.isArray(visited)) {
            throw new TypeError('Argument "visited" must be an Array')
        }
        this.visited = visited

        if (typeof title !== 'undefined' && typeof title !== 'string' && title !== null) {
            throw new TypeError('Argument "title" must be a string or null')
        }
        this.title = title

        if (typeof doors !== 'object') {
            throw new TypeError('Argument \'doors\' must be a string or null')
        }
        this.doors = doors
    }
}

class ObjectProperties {
    constructor({size, baseWeight, weight = baseWeight, fixture = false, visible = true, transparent = false}) {

        if (typeof size !== 'number') {
            throw new TypeError('Argument \'size\' must be a number')
        }
        this.size = size

        if (typeof weight !== 'number') {
            throw new TypeError('Argument \'weight\' must be a number')
        }
        this.weight = weight

        if (typeof baseWeight !== 'number') {
            throw new TypeError('Argument \'baseWeight\' must be a number')
        }
        this.baseWeight = baseWeight

        this.fixture = fixture

        this.visible = visible

        this.transparent = transparent
    }
}

class Container {
    constructor({volume, maxLoad, freeVolume = volume, contents = [], fixtures = [], open = true, surface = false}) {

        if (typeof volume !== 'number') {
            throw new TypeError('Argument \'volume\' must be a number')
        }
        this.volume = volume

        if (typeof freeVolume !== 'number') {
            throw new TypeError('Argument \'freeVolume\' must be a number')
        }
        this.freeVolume = freeVolume

        if (typeof maxLoad !== 'number') {
            throw new TypeError('Argument \'maxLoad\' must be a number')
        }
        this.maxLoad = maxLoad

        // if (typeof contents.entries !== 'function') {
        if (!Array.isArray(contents)) {
            throw new TypeError('Argument \'contents\' must be an Array')
        }
        // contents = new Set(contents)
        // }
        this.contents = contents

        if (typeof fixtures.entries !== 'function') {
            if (!Array.isArray(fixtures)) {
                throw new TypeError('Argument \'fixtures\' must be an Array or Set')
            }
            fixtures = new Set(fixtures)
        }
        this.fixtures = fixtures

        if (typeof open !== 'boolean') {
            throw new TypeError('Argument \'open\' must be a boolean')
        }
        this.open = open

        if (typeof surface !== 'boolean') {
            throw new TypeError('Argument \'surface\' must be a boolean')
        }
        this.surface = surface
    }
}

// class PlayerInput {
//     constructor() {
//         this.queue = []
//     }

//     getQueue() {
//         return this.queue.slice()
//     }

//     setQueue(queue) {
//         if (!Array.isArray(queue)) {
//             throw new TypeError('Queue must be an Array')
//         }
//         this.queue = queue
//     }
// }

class Tool {
    constructor(type) {
        if (typeof type !== 'undefined' && typeof type !== 'string' && type !== null) {
            throw new TypeError('Argument "type" must be a string or null')
        }
        this.type = type
    }
}

class Location {
    constructor(parent = null) {
        this.parent = parent
    }
}

class Actor {
    constructor(initiative = 2) {
        this.initiative = initiative
    }
}

/* eslint-disable require-jsdoc */
function assertBoolean(bool) {
    if (typeof bool !== 'boolean') {
        throw new TypeError('Argument must be a boolean')
    }
}

module.exports = {
    // PlayerInput,
    Descriptors,
    Container,
    Location,
    Appearance,
    Text,
    ObjectProperties,
    Area,
    Option,
    Tool,
    Actor,
}
