class Descriptors {
    constructor(labels, descriptors = [], name) {
        // if (!Array.isArray(labels)) {
        //     throw new TypeError('Names must be an Array')
        // }
        // if (!labels.length) {
        //     throw new RangeError('Names cannot be empty')
        // }
        this.setLabels(labels)
        // this.labels = labels
        // this.descriptors = descriptors
        this.setDescriptors(descriptors)
        this.name = name || labels[0]
    }

    getDescriptors() {
        return this.descriptors.slice()
    }

    getLabels() {
        return this.labels.slice()
    }

    getName() {
        return this.name
    }

    setDescriptors(descriptors) {
        if (!Array.isArray(descriptors)) {
            throw new TypeError('Descriptors must be an Array')
        }
        this.descriptors = descriptors
    }

    setLabels(labels) {
        if (!Array.isArray(labels)) {
            throw new TypeError('Labels must be an Array')
        }
        if (!labels.length) {
            throw new RangeError('Labels cannot be empty')
        }
        this.labels = labels
    }

    setName(name) {
        if (!(typeof name === 'string')) {
            throw new TypeError('Name must be a string')
        }
        if (!name.length) {
            throw new RangeError('Name cannot be empty string')
        }
        this.name = name
    }
}

class Appearance {
    constructor(appearance) {
        this.setAppearance(appearance)
    }

    getAppearance() {
        return this.appearance
    }

    setAppearance(appearance) {
        if (typeof appearance !== 'undefined' && typeof appearance !== 'string' && appearance !== null) {
            throw new TypeError('Argument "appearance" must be a string or null')
        }
        this.appearance = appearance
    }
}

class Area {
    constructor(title, visited = [], doors = {}) {
        this.setTitle(title)
        this.setVisited(visited)
        this.setDoors(doors)
    }

    getVisited() {
        return this.visited.slice()
    }

    getTitle() {
        return this.title
    }

    getDoors() {
        // TODO: Normalize this everywhere.
        return Object.assign({}, this.doors)
    }

    setVisited(visited) {
        if (!Array.isArray(visited)) {
            throw new TypeError('Argument "visited" must be an Array')
        }
        this.visited = visited
    }

    setTitle(title) {
        if (typeof title !== 'undefined' && typeof title !== 'string' && title !== null) {
            throw new TypeError('Argument "title" must be a string or null')
        }
        this.title = title

    }
    setDoors(doors) {
        if (typeof doors !== 'object') {
            throw new TypeError('Argument \'doors\' must be a string or null')
        }
        this.doors = doors
    }
}

class ObjectProperties {
    constructor({size, baseWeight, weight = baseWeight, visible = true, transparent = false}) {
        this.setSize(size)
        this.setBaseWeight(baseWeight)
        this.setWeight(weight)
        this.setVisible(visible)
        this.setTransparent(transparent)
    }

    getSize() {
        return this.size
    }

    getBaseWeight() {
        return this.baseWeight
    }

    getWeight() {
        return this.weight
    }

    getVisible() {
        return this.visible
    }

    getTransparent() {
        return this.transparent
    }

    setSize(size) {
        if (typeof size !== 'number') {
            throw new TypeError('Argument \'size\' must be a number')
        }
        this.size = size
    }

    setWeight(weight) {
        if (typeof weight !== 'number') {
            throw new TypeError('Argument \'weight\' must be a number')
        }
        this.weight = weight
    }

    setBaseWeight(baseWeight) {
        if (typeof baseWeight !== 'number') {
            throw new TypeError('Argument \'baseWeight\' must be a number')
        }
        this.baseWeight = baseWeight
    }

    setVisible(visible) {
        this.assertBoolean(visible)
        this.visible = visible
    }

    setTransparent(transparent) {
        this.assertBoolean(transparent)
        this.transparent = transparent
    }

    assertBoolean(bool) {
        if (typeof bool !== 'boolean') {
            throw new TypeError('Argument must be a boolean')
        }
    }
}

class Container {
    constructor({volume, maxLoad, freeVolume = volume, contents = [], open = true}) {
        this.setVolume(volume)
        this.setFreeVolume(freeVolume)
        this.setMaxLoad(maxLoad)
        // this.setLoad(load)
        this.setContents(contents)
        this.setOpen(open)
    }

    getMaxLoad() {
        return this.maxLoad
    }

    getVolume() {
        return this.volume
    }

    getFreeVolume() {
        return this.freeVolume
    }

    getContents() {
        return new Set(this.contents)
    }

    // getLoad() {
    //     return this.load
    // }

    isOpen() {
        return this.open
    }

    setVolume(volume) {
        if (typeof volume !== 'number') {
            throw new TypeError('Argument \'volume\' must be a number')
        }
        this.volume = volume
    }

    setFreeVolume(freeVolume) {
        if (typeof freeVolume !== 'number') {
            throw new TypeError('Argument \'freeVolume\' must be a number')
        }
        this.freeVolume = freeVolume
    }

    setMaxLoad(maxLoad) {
        if (typeof maxLoad !== 'number') {
            throw new TypeError('Argument \'maxLoad\' must be a number')
        }
        this.maxLoad = maxLoad
    }

    // setLoad(load) {
    //     if (typeof load !== 'number') {
    //         throw new TypeError('Argument \'load\' must be a number')
    //     }
    //     this.load = load
    // }

    setContents(contents) {
        if (typeof contents.entries !== 'function') {
            if (!Array.isArray(contents)) {
                throw new TypeError('Argument \'contents\' must be an Array or Set')
            }
            contents = new Set(contents)
        }
        this.contents = contents
    }

    setOpen(open) {
        if (typeof open !== 'boolean') {
            throw new TypeError('Argument \'open\' must be a boolean')
        }
        this.open = open
    }
}

class PlayerInput {
    constructor() {
        this.queue = []
    }

    getQueue() {
        return this.queue.slice()
    }

    setQueue(queue) {
        if (!Array.isArray(queue)) {
            throw new TypeError('Queue must be an Array')
        }
        this.queue = queue
    }
}

class Location {
    constructor(parent = null) {
        this.parent = parent
    }

    getParent() {
        return this.parent
    }

    setParent(parent) {
        this.parent = parent
    }
}

module.exports = {
    PlayerInput,
    Descriptors,
    Container,
    Location,
    Appearance,
    ObjectProperties,
    Area,
}
