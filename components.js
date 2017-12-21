class ObjectDescriptorComponent {
    constructor(names, descriptors) {
        this.names = names
        this.descriptors = descriptors
    }

    getDescriptors() {
        return this.descriptors
    }

    getNames() {
        return this.names
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
        this.names = names
    }
}

module.exports = {
    ObjectDescriptorComponent,
}
