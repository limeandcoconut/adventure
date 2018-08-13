const {entityManager: em} = require('../managers.js')

const methods = {
    formatContents(contents, entity) {

        contents = Array.from(contents)

        const newContents = []
        for (let i = 0; i < contents.length; i++) {
            const id = contents[i]

            let properties = em.getComponent('ObjectProperties', id)
            if (id === entity || (!properties && properties.getVisible())) {
                continue
            }
            let item = {
                id,
            }
            let container = em.getComponent('Container', id)
            if (container && (container.isOpen() || (properties && properties.getTransparent()))) {
                item.contents = methods.formatContents(container.getContents(), entity)
            }
            newContents.push(item)
        }

        return newContents
    },

    put(object, source, destination) {
        const destinationContainer = em.getComponent('Container', destination)
        const destinationFreeVolume = destinationContainer.getFreeVolume()

        const objectProperties = em.getComponent('ObjectProperties', object)
        const objectSize = objectProperties.getSize()

        // If the object wont fit into the destination fail.
        if (objectSize > destinationFreeVolume) {
            return {
                reason: 'Too Big.',
                object,
                destination,
            }
        }

        // Build a list of containers already carrying this load.
        let parent = source
        let sourceParents = [parent]

        do {
            parent = em.getComponent('Location', parent).getParent()
            sourceParents.push(parent)
        // If the destination is in the list or the list is complete stop.
        } while (parent && parent !== destination)

        // Refit if the load is valid through the whole tree.
        const objectWeight = objectProperties.getWeight()
        // If a reason is returned then this failed.
        // If parents are returned that means this was successful and they should be modified.
        sourceParents = this.checkWeight(objectWeight, destination, destinationContainer, sourceParents)
        if (sourceParents.reason) {
            sourceParents.object = object
            return sourceParents
        }

        // Weights were successfully refit so refit the parents' weights.
        // There's no guarantee that a parent will need it's weight modified.
        parent = sourceParents.shift()
        while (parent) {
            let parentProperties = em.getComponent('ObjectProperties', parent)
            let parentWeight = em.getComponent('ObjectProperties', parent).getWeight()
            parentProperties.setWeight(parentWeight - objectWeight)
            parent = sourceParents.shift()
        }

        // Set the destination's volume.
        destinationContainer.setFreeVolume(destinationFreeVolume - objectSize)

        // Set the destination's contents.
        destinationContainer.setContents(destinationContainer.getContents().add(object))
        // Set the object to be in the destination.
        em.getComponent('Location', object).setParent(destination)

        // Remove the object from the source's contents
        const sourceContainer = em.getComponent('Container', source)
        const sourceContents = sourceContainer.getContents()
        sourceContents.delete(object)
        sourceContainer.setContents(sourceContents)

        // Increase the source's free volume.
        const sourceFreeVolume = sourceContainer.getFreeVolume()
        sourceContainer.setFreeVolume(sourceFreeVolume + objectSize)

        this.logResults(object, source, destination)
    },

    checkWeight(weight, target, targetContainer, sourceParents) {
    // If the target container is in the list of containers already bearing this weight don't continue to refit.
        let index = sourceParents.indexOf(target)
        if (index !== -1) {
        // Return the list of parents in need of a refit.
            return sourceParents.slice(0, index)
        }
        // What the target can carry.
        const maxLoad = targetContainer.getMaxLoad()
        const targetProperties = em.getComponent('ObjectProperties', target)
        // What it currently weights including contents.
        const targetWeight = targetProperties.getWeight()
        // What it weighs empty.
        const targetBaseWeight = targetProperties.getBaseWeight()
        // What it would weigh with the new weight added.
        // Done this way to save a recalculation of weight for the parent.
        const newWeight = targetWeight + weight
        const maxWeight = targetBaseWeight + maxLoad
        // If the new weight is withing limits this step succeeds.
        if (newWeight > maxWeight) {
            return {
                reason: 'Too heavy.',
                container: target,
            }
        }

        const parent = em.getComponent('Location', target).getParent()
        // If there is a parent then check if it can support this.
        if (parent) {
            const parentContainer = em.getComponent('Container', parent)
            // If the rest of the tree cannot support this, fail all the way down.
            // If a reason is returned then this has failed.
            // If parents are returned that means this was successful and they should be modified.
            sourceParents = this.checkWeight(weight, parent, parentContainer, sourceParents)
            if (sourceParents.reason) {
                return sourceParents
            }
        }
        // If there is no parent then there is nothing to check and the whole operation succeeds.
        // If the operation is valid for the whole tree commit it.
        targetProperties.setWeight(newWeight)
        return sourceParents
    },

    logResults(object, source, destination) {
        console.log('OBJECT:')
        console.log(JSON.stringify(em.getComponent('ObjectProperties', object), null, 4))
        console.log('SOURCE:')
        console.log(JSON.stringify(em.getComponent('ObjectProperties', source), null, 4))
        console.log(JSON.stringify(em.getComponent('Container', source), null, 4))
        let s = em.getComponent('Location', source).getParent()
        while (s) {
            console.log('SOURCE PARENT:')
            console.log(JSON.stringify(em.getComponent('ObjectProperties', s), null, 4))
            console.log(JSON.stringify(em.getComponent('Container', s), null, 4))
            s = em.getComponent('Location', s).getParent()
        }
        console.log('DESTINATION:')
        console.log(JSON.stringify(em.getComponent('ObjectProperties', destination), null, 4))
        console.log(JSON.stringify(em.getComponent('Container', destination), null, 4))
        let d = em.getComponent('Location', destination).getParent()
        while (d) {
            console.log('DESTINATION PARENT:')
            console.log(JSON.stringify(em.getComponent('ObjectProperties', d), null, 4))
            console.log(JSON.stringify(em.getComponent('Container', d), null, 4))
            d = em.getComponent('Location', d).getParent()
        }
        console.log('')
        console.log('')
    },
}

const keys = Object.keys(methods)
for (let key of keys) {
    console.log(key)
    if (Object.prototype.hasOwnProperty.call(methods, key)) {
        methods[key] = methods[key].bind(methods)
    }
}

module.exports = methods
