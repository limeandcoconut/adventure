class ObjectDescriptorComponent {
    constructor(names, descriptors = []) {
        if (!Array.isArray(names)) {
            throw new TypeError('Names must be an Array.')
        }
        if (!names.length) {
            throw new RangeError('Names cannot be empty.')
        }
        this.names = names
        this.descriptors = descriptors
    }

    getDescriptors() {
        return this.descriptors.slice()
    }

    getNames() {
        return this.names.slice()
    }

    setDescriptors(descriptors) {
        if (!Array.isArray(descriptors)) {
            throw new TypeError('Descriptors must be an Array.')
        }
        this.descriptors = descriptors
    }

    setNames(names) {
        if (!Array.isArray(names)) {
            throw new TypeError('Names must be an Array.')
        }
        if (!names.length) {
            throw new RangeError('Names cannot be empty.')
        }
        this.names = names
    }
}

class ContainerComponent {
    constructor(contents = [], open = true) {
        if (typeof contents.entries !== 'function') {
            if (!Array.isArray(contents)) {
                throw new TypeError('Contents must be an Array or Set.')
            }
            contents = new Set(contents)
        }

        this.contents = contents
        this.open = open
    }

    getContents() {
        return new Set(this.contents)
    }

    setContents(contents) {
        if (typeof contents.entries !== 'function') {
            if (!Array.isArray(contents)) {
                throw new TypeError('Contents must be an Array or Set.')
            }
            contents = new Set(contents)
        }
        this.contents = contents
    }

    isOpen() {
        return this.open
    }

    setOpen(open) {
        this.open = open
    }
}

class LocationComponent {
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
    ObjectDescriptorComponent,
    ContainerComponent,
    LocationComponent,
}
