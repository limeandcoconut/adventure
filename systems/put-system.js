const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')
const {logAction} = require('../helpers')
/* eslint-disable require-jsdoc */
class PutSystem extends System {

    update(action) {
        logAction(action)
        let {entity: {id: entity}, object: {direct, indirect}} = action
        if (!direct.apparent) {
            this.fail(action, {
                reason: 'Inapparent.',
                object: direct.id,
                container: direct.container,
            })
            return
        }

        if (!direct.accessible) {
            this.fail(action, {
                reason: 'Inaccessible.',
                object: direct.id,
                container: direct.container,
            })
            return
        }

        if (!indirect.apparent) {
            this.fail(action, {
                reason: 'Inapparent.',
                object: indirect,
                container: indirect.container,
            })
            return
        }

        if (!indirect.accessible) {
            this.fail(action, {
                reason: 'Inaccessible.',
                object: indirect,
                container: indirect.container,
            })
            return
        }

        console.log('---------- PUT ---------')
        const {id: item} = direct
        const {id: target} = indirect

        if (direct.parent !== entity) {
            // TODO: Maybe these should be put into different actions.
            // TODO: Fix this.
            action.object.id = direct.id
            action.object.accessible = direct.accessible
            action.object.apparent = direct.apparent
            action.object.parent = direct.parent
            action.object.root = direct.root
            action.procedure.push('get')
            action.procedure.push('locate')
            action.procedure.push('put')
            return
        }

        const targetContainer = em.getComponent('Container', target)
        const targetFreeVolume = targetContainer.getFreeVolume()

        const itemProperties = em.getComponent('ObjectProperties', item)
        const itemSize = itemProperties.getSize()

        // If the item wont fit into the target fail.
        if (!(itemSize <= targetFreeVolume)) {
            this.fail(action, {reason: 'Wont\'t Fit.'})
            return
        }

        // Build a list of containers already carrying this load.
        let parent = entity
        const entityParents = [entity]
        do {
            parent = em.getComponent('Location', parent).getParent()
            entityParents.push(parent)
            // If the target is in the list or the list is complete stop.
        } while (parent && parent !== target)

        // Refit if the load is valid through the whole tree.
        const itemWeight = itemProperties.getWeight()
        if (!this.checkWeight(itemWeight, target, targetContainer, entityParents)) {
            // If not, fail.
            this.fail(action, {reason: 'Too Heavy.'})
            return
        }

        // Weights were successfully refit.
        // Set the target's volume.
        targetContainer.setFreeVolume(targetFreeVolume - itemSize)

        // Set the targets contents.
        targetContainer.setContents(targetContainer.getContents().add(item))
        // Set the item to be in the target.
        em.getComponent('Location', item).setParent(target)

        // Remove the item from the entity's contents
        const entityContainer = em.getComponent('Container', entity)
        const entityContents = entityContainer.getContents()
        entityContents.delete(item)
        entityContainer.setContents(entityContents)
        // Increase the entity's free volume.
        const entityFreeVolume = entityContainer.getFreeVolume()
        entityContainer.setFreeVolume(entityFreeVolume - itemSize)

        action.steps.set('put', {
            success: true,
        })
    }

    checkWeight(weight, target, container, entityParents) {
        // If the target container is in the list of containers already bearing this weight don't continue to refit.
        if (entityParents.includes(target)) {
            return true
        }
        // What the target can carry.
        const maxLoad = container.getMaxLoad()
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
            return false
        }

        const parent = em.getComponent('Location', target).getParent()
        // If there is a parent then check if it can support this.
        if (parent) {
            const parentContainer = em.getComponent('Container', parent)
            // See if the rest of the tree can support this.
            // If not then fail all the way down.
            if (!this.checkWeight(newWeight, parent, parentContainer, entityParents)) {
                return false
            }
        }
        // If there is no parent then there is nothing to check and the whole operation succeeds.
        // If the operation is valid for the whole tree commit it.
        targetProperties.setWeight(newWeight)
        return true
    }
    fail(action, info) {
        info.success = false
        info.id = action.object.id
        action.steps.set('put', info)
        action.live = false
    }
}

module.exports = PutSystem
