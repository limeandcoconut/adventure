const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class MovementSystem extends System {

    update(action) {

        // console.log('-------- MOVE --------')
        if (action.object.id) {
            this.teleport(action)
        } else {
            this.move(action)
        }

        if (action.live) {
            action.steps.set('move', {
                success: true,
            })
        }
    }

    teleport(action) {
        let {entity: {id: entity}, object: {id: destination}} = action

        this.goTo(em.getComponent('Location', entity), destination, entity, action)
    }

    move(action) {
        let {entity: {id: entity}, object: {word: direction}} = action
        const location = em.getComponent('Location', entity)

        let doors = em.getComponent('Area', location.getParent()).getDoors()
        direction = direction.match(/^(n)?(?:orth)?(s)?(?:outh)?(e)?(?:ast)?(w)?(?:est)?$|^(d)?(?:own)$|^(u)?(?:p)?$/)
        direction = direction.slice(1, 6).join('')

        let destination = doors[direction]
        action.info.direction = direction

        if (typeof destination !== 'number') {
            this.fail(action, {reason: 'No Door.', direction})
            return
        }

        this.goTo(location, destination, entity, action)
    }

    goTo(location, destination, entity, action) {
        const parentContainer = em.getComponent('Container', location.getParent())
        const destinationContainer = em.getComponent('Container', destination)

        const parentContents = parentContainer.getContents()
        const destinationContents = destinationContainer.getContents()

        location.setParent(destination)
        parentContents.delete(entity)
        parentContainer.setContents(parentContents)
        destinationContents.add(entity)
        destinationContainer.setContents(destinationContents)

        const area = em.getComponent('Area', destination)
        const visited = area.getVisited()

        if (!visited.includes(entity)) {
            visited.push(entity)
            area.setVisited(visited)
            action.procedure.push('locate')
            action.procedure.push('look')
        }

        action.object.id = destination
        action.info.parent = destination
        action.info.area = area
    }

    fail(action, info) {
        info.success = false
        action.steps.set('move', info)
        action.live = false
    }
}

module.exports = MovementSystem
