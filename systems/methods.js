
const methods = {
    formatContents(contents, entity) {
        contents = Array.from(contents)

        const dummyContents = []
        for (let i = 0; i < contents.length; i++) {
            const object = contents[i]

            const properties = object.properties
            if (object === entity || (properties && !properties.visible)) {
                continue
            }
            const container = object.container
            const dummy = {
                object,
            }
            // If there is a container and the contents are apparent and the container has contents.
            if (container && (container.open || (properties && properties.transparent)) && container.contents.length) {
                dummy.contents = this.formatContents(container.contents, entity)
            }
            dummyContents.push(dummy)
        }

        return dummyContents
    },

    put(object, source, destination) {
        // const object.properties = object.properties

        if (object.properties.fixture) {
            return {
                reason: 'Fixture.',
                code: 'gx-ft',
                object,
            }
        }

        // const destination.container = destination.container

        // Build a list of containers already carrying this load.
        let parent = source
        let sourceParents = [parent]

        do {
            parent = parent.location.parent
            sourceParents.push(parent)
        // If the destination is in the list or the list is complete stop.
        } while (parent && parent !== destination)

        // If the destination is closed and doesn't contain the source, fail.
        // TODO: Check if you can move an item up inside a nested set of containers whose parent is closed to you.
        if (!destination.container.open && !sourceParents.includes(destination)) {
            return {
                success: false,
                reason: 'Destination closed.',
                code: 'mp-cc',
                object,
                container: destination,
            }
        }

        // const destinationFreeVolume = destination.container.freeVolume

        // const object.properties.size = object.properties.size

        // If the object won't fit into the destination fail.
        if (object.properties.size > destination.container.freeVolume) {
            return {
                success: false,
                reason: 'Too Big.',
                code: 'mp-tb',
                object,
                container: destination,
            }
        }

        // Refit if the load is valid through the whole tree.
        // const objectWeight = object.properties.weight
        // If a reason is returned then this failed.
        // If parents are returned that means this was successful and they should be modified.
        sourceParents = this.checkWeight(object.properties.weight, destination, sourceParents)
        if (sourceParents.code) {
            sourceParents.object = object
            return sourceParents
        }

        // Weights were successfully refit, so refit the parents' weights.
        // There's no guarantee that a parent will need it's weight modified.
        parent = sourceParents.shift()
        while (parent) {
            // let parentProperties = em.getComponent('ObjectProperties', parent)
            // let parentWeight = em.getComponent('ObjectProperties', parent).getWeight()
            parent.properties.weight -= object.properties.weight
            parent = sourceParents.shift()
        }

        // Set the destination's volume.
        destination.container.freeVolume -= object.properties.size

        // Set the destination's contents.
        destination.container.contents.push(object)
        // Set the object to be in the destination.
        object.location.parent = destination

        // Remove the object from the source's contents
        // const sourceContainer = em.getComponent('Container', source)
        // const sourceContents = sourceContainer.getContents()
        source.container.contents.splice(source.container.contents.indexOf(object), 1)
        // sourceContainer.setContents(sourceContents)

        // Increase the source's free volume.
        // const sourceFreeVolume = sourceContainer.getFreeVolume()
        source.container.freeVolume += object.properties.size

        // this.logResults(object, source, destination)
    },

    checkWeight(weight, target, sourceParents) {
        // If the target container is in the list of containers already bearing this weight don't continue to refit.
        let index = sourceParents.indexOf(target)
        if (index !== -1) {
        // Return the list of parents in need of a refit.
            return sourceParents.slice(0, index)
        }
        // What the target can carry.
        // const maxLoad = target.container.maxLoad
        // const targetProperties = target.properties
        // What it currently weights including contents.
        // const targetWeight = targetProperties.weight
        // What it weighs empty.
        // const targetBaseWeight = targetProperties.baseWeight
        // What it would weigh with the new weight added.
        // Done this way to save a recalculation of weight for the parent.
        const newWeight = target.properties.weight + weight
        const maxWeight = target.properties.baseWeight + target.container.maxLoad
        // If the new weight is withing limits this step succeeds.
        if (newWeight > maxWeight) {
            return {
                success: false,
                reason: 'Too heavy.',
                code: 'mp-th',
                container: target,
            }
        }

        // If there is a parent then check if it can support this.
        if (target.location.parent) {
            // If the rest of the tree cannot support this, fail all the way down.
            // If a reason is returned then this has failed.
            // If parents are returned that means this was successful and they should be modified.
            sourceParents = this.checkWeight(weight, target.location.parent, sourceParents)
            if (sourceParents.code) {
                return sourceParents
            }
        }
        // If there is no parent then there is nothing to check and the whole operation succeeds.
        // If the operation is valid for the whole tree commit it.
        target.properties.weight = newWeight
        return sourceParents
    },

    // logResults(object, source, destination) {
    // console.log('OBJECT:')
    // console.log(JSON.stringify(em.getComponent('ObjectProperties', object), null, 4))
    // console.log('SOURCE:')
    // console.log(JSON.stringify(em.getComponent('ObjectProperties', source), null, 4))
    // console.log(JSON.stringify(em.getComponent('Container', source), null, 4))
    // let s = em.getComponent('Location', source).getParent()
    // while (s) {
    //     console.log('SOURCE PARENT:')
    //     console.log(JSON.stringify(em.getComponent('ObjectProperties', s), null, 4))
    //     console.log(JSON.stringify(em.getComponent('Container', s), null, 4))
    //     s = em.getComponent('Location', s).getParent()
    // }
    // console.log('DESTINATION:')
    // console.log(JSON.stringify(em.getComponent('ObjectProperties', destination), null, 4))
    // console.log(JSON.stringify(em.getComponent('Container', destination), null, 4))
    // let d = em.getComponent('Location', destination).getParent()
    // while (d) {
    //     console.log('DESTINATION PARENT:')
    //     console.log(JSON.stringify(em.getComponent('ObjectProperties', d), null, 4))
    //     console.log(JSON.stringify(em.getComponent('Container', d), null, 4))
    //     d = em.getComponent('Location', d).getParent()
    // }
    // console.log('')
    // console.log('')
    // },
}

const keys = Object.keys(methods)
for (let key of keys) {
    if (Object.prototype.hasOwnProperty.call(methods, key)) {
        methods[key] = methods[key].bind(methods)
    }
}

module.exports = methods
