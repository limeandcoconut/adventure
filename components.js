class ObjectDescriptorComponent {
    constructor(labels, descriptors = [], name) {
        // if (!Array.isArray(labels)) {
        //     throw new TypeError('Names must be an Array.')
        // }
        // if (!labels.length) {
        //     throw new RangeError('Names cannot be empty.')
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
            throw new TypeError('Descriptors must be an Array.')
        }
        this.descriptors = descriptors
    }

    setLabels(labels) {
        if (!Array.isArray(labels)) {
            throw new TypeError('Labels must be an Array.')
        }
        if (!labels.length) {
            throw new RangeError('Labels cannot be empty.')
        }
        this.labels = labels
    }

    setName(name) {
        if (!(typeof name === 'string')) {
            throw new TypeError('Name must be a string.')
        }
        if (!name.length) {
            throw new RangeError('Name cannot be empty string.')
        }
        this.name = name
    }
}

class AppearanceComponent {
    constructor(appearance, visible = true) {
        this.setAppearance(appearance)
        this.setVisible(visible)
    }

    getAppearance() {
        return this.appearance
    }

    setAppearance(appearance) {
        if (typeof appearance !== 'undefined' && typeof appearance !== 'string') {
            throw new TypeError('Argument "appearance" must be a string if defined.')
        }
        this.appearance = appearance
    }

    getVisible() {
        return this.visible
    }

    setVisible(visible) {
        if (typeof visible !== 'boolean') {
            throw new TypeError('Argument "visible" must be a boolean')
        }
        this.visible = visible
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
    AppearanceComponent,
}
