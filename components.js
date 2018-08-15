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

class Option {
    constructor(value = false) {
        this.setValue(value)
    }

    getValue() {
        return this.value
    }

    setValue(value) {
        assertBoolean(value)
        this.value = value
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

class Text {
    constructor(text) {
        this.setText(text)
    }

    getText() {
        return this.text
    }

    setText(text) {
        if (typeof text !== 'undefined' && typeof text !== 'string' && text !== null) {
            throw new TypeError('Argument "text" must be a string or null')
        }
        this.text = text
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
    constructor({size, baseWeight, weight = baseWeight, fixture = false, visible = true, transparent = false}) {
        this.setSize(size)
        this.setBaseWeight(baseWeight)
        this.setWeight(weight)
        this.setFixture(fixture)
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

    isFixture() {
        return this.fixture
    }

    isVisible() {
        return this.visible
    }

    isTransparent() {
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

    setFixture(fixture) {
        assertBoolean(fixture)
        this.fixture = fixture
    }

    setVisible(visible) {
        assertBoolean(visible)
        this.visible = visible
    }

    setTransparent(transparent) {
        assertBoolean(transparent)
        this.transparent = transparent
    }
}

class Container {
    constructor({volume, maxLoad, freeVolume = volume, contents = [], fixtures = [], open = true, surface = false}) {
        this.setVolume(volume)
        this.setFreeVolume(freeVolume)
        this.setMaxLoad(maxLoad)
        // this.setLoad(load)
        this.setContents(contents)
        this.setFixtures(fixtures)
        this.setOpen(open)
        this.setSurface(surface)
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

    getFixtures() {
        return this.fixtures
    }

    isOpen() {
        return this.open
    }

    isSurface() {
        return this.surface
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

    setContents(contents) {
        if (typeof contents.entries !== 'function') {
            if (!Array.isArray(contents)) {
                throw new TypeError('Argument \'contents\' must be an Array or Set')
            }
            contents = new Set(contents)
        }
        this.contents = contents
    }

    setFixtures(fixtures) {
        if (typeof fixtures.entries !== 'function') {
            if (!Array.isArray(fixtures)) {
                throw new TypeError('Argument \'fixtures\' must be an Array or Set')
            }
            fixtures = new Set(fixtures)
        }
        this.fixtures = fixtures
    }

    setOpen(open) {
        if (typeof open !== 'boolean') {
            throw new TypeError('Argument \'open\' must be a boolean')
        }
        this.open = open
    }

    setSurface(surface) {
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
        this.setType(type)
    }

    getType() {
        return this.type
    }

    setType(type) {
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

    getParent() {
        return this.parent
    }

    setParent(parent) {
        this.parent = parent
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
}
