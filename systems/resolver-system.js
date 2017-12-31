const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class ResolverSystem extends System {
    constructor() {
        super()
        this.requiredComponents = ['LocationComponent']
        this.acceptedActions = ['get', 'drop']
    }

    update() {
        this.channel.events.forEach((action) => {

            if (!this.acceptedActions.includes(action.type) || !action.live) {
                return
            }

            console.log('---------- RESOLVE ---------')

            let objects = this.extractObjects(action)

            for (let object of objects) {
                let {success, id, reason} = this.resolve(object)
                if (success) {
                    object.id = id
                } else {
                    action.steps.set('resolve', {
                        success,
                        reason,
                    })
                    action.live = false
                    console.log(action)
                    return
                }
            }

            action.steps.set('resolve', {
                success: true,
            })
            console.log(action)
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

        let name = object.word
        if (name === 'all' || name === 'everything') {
            if (descriptors.length) {
                throw new Error('Descriptors on "all"')
            }
            // Resolve to everything.
            return {
                success: true,
                id: -1,
            }
        }

        let entities = em.getEntitiesWithComponent('ObjectDescriptorComponent')

        let best = {
            entities: [],
            // Make 0 not count
            score: 1,
        }

        // Check to see how well each entity matches our search.
        entities.forEach((entity) => {
            let descriptorComponent = em.getComponent('ObjectDescriptorComponent', entity)

            // If this is not the item we're looking for skip it.
            if (name !== 'anything' && !descriptorComponent.getNames().includes(name)) {
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
            // If there are no descriptors this entity is a name match.
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
            // result.fatal = true
        } else {
            result.success = false
            // result.fatal = true
            result.reason = 'Cannot resolve entity.'
        }

        return result
    }

    mutate(channel) {
        this.channel = channel
    }
}

module.exports = ResolverSystem

