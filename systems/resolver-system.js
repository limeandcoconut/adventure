const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class ResolverSystem extends System {

    update(action) {

        // console.log('---------- RESOLVE ---------')

        let objects = this.extractObjects(action)

        if (typeof objects[0].id === 'undefined') {
            for (let i = 0; i < objects.length; i++) {
                const object = objects[i]
                let result = this.resolve(object)
                if (result.success) {
                    object.id = result.id
                } else {
                    action.steps.set('resolve', result)
                    action.live = false
                    return
                }
            }
        }

        action.steps.set('resolve', {
            success: true,
        })
    }

    extractObjects(action) {
        if (action.object.type === 'infix') {
            let {direct, indirect} = action.object
            return [direct, indirect]
        }

        return [action.object]
    }

    resolve(object) {
        let descriptors = object.descriptors.slice()

        let label = object.word
        if (label === 'all' || label === 'everything') {
            if (descriptors.length) {
                throw new Error('Descriptors on "all"')
            }
            // Resolve to everything.
            return {
                success: true,
                id: -1,
            }
        }

        let entities = em.getEntitiesWithComponent('Descriptors')

        let best = {
            entities: [],
            // Make 0 not count
            score: 1,
        }

        // Check to see how well each entity matches our search.
        entities.forEach((entity) => {
            let descriptorComponent = em.getComponent('Descriptors', entity)

            // If this is not the item we're looking for skip it.
            if (label !== 'anything' && !descriptorComponent.getLabels().includes(label)) {
                return
            }

            // If we have descriptors to match score this entity.
            if (descriptors.length) {
                let entityDescriptors = descriptorComponent.getDescriptors()
                let score = descriptors.filter(descriptor => entityDescriptors.includes(descriptor))
                score = score.length
                if (score > best.score) {
                    // New best.
                    best.score = score
                    best.entities = [entity]
                } else if (score === best.score) {
                    // Add a tie.
                    best.entities.push(entity)
                }
            // If there are no descriptors this entity is a label match.
            } else {
                best.entities.push(entity)
            }
        })

        let result = {
            success: true,
        }
        if (best.entities.length === 1) {
            result.id = best.entities[0]
        } else if (best.entities.length > 1) {
            result.success = false
            result.reason = `Multiple entities: ${best.entities}`
            result.objects = best.entities
        } else {
            result.success = false
            result.reason = 'Cannot resolve entity.'
            let descriptors = object.descriptors.length ? object.descriptors.join(' ') + ' ' : ''
            result.object = descriptors + object.word
        }

        return result
    }
}

module.exports = ResolverSystem

