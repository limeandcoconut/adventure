const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')
const {put} = require('./methods')

class MovementSystem extends System {

    update(action) {

        // console.log('-------- MOVE --------')
        // const method = typeof action.object.id !== 'undefined' ? this.teleport : this.move
        // let method
        let info

        if (action.object.id) {
            info = this.teleport(action)
        } else {
            info = this.move(action)
        }

        // if (action.live) {
        action.steps.set('move', info)
        action.live = info.success
        // }
    }

    teleport(action) {
        let {entity: {id: entity}, object: {id: destination}} = action

        return this.goTo(em.getComponent('Location', entity).getParent(), destination, entity, action)
    }

    move(action) {
        let {entity: {id: entity}, object: {word: direction}} = action
        // const location =
        const parent = em.getComponent('Location', entity).getParent()

        let doors = em.getComponent('Area', parent).getDoors()
        direction = direction.match(/^(n)?(?:orth)?(s)?(?:outh)?(e)?(?:ast)?(w)?(?:est)?$|^(d)?(?:own)$|^(u)?(?:p)?$/)
        direction = direction.slice(1, 6).join('')

        let destination = doors[direction]
        // action.info.direction = direction

        if (typeof destination !== 'number') {
            return {
                reason: 'No Door.',
                direction,
                success: false,
            }
        }

        action.object.id = destination
        const info = this.goTo(parent, destination, entity, action)
        info.direction = direction
        return info
    }

    goTo(parent, destination, entity, action) {
        const putResult = put(entity, parent, destination)
        if (putResult) {
            putResult.success = false
            return putResult
        }

        // const parentContainer = em.getComponent('Container', location.getParent())
        // const destinationContainer = em.getComponent('Container', destination)

        // const parentContents = parentContainer.getContents()
        // const destinationContents = destinationContainer.getContents()

        // location.setParent(destination)
        // parentContents.delete(entity)
        // parentContainer.setContents(parentContents)
        // destinationContents.add(entity)
        // destinationContainer.setContents(destinationContents)

        const area = em.getComponent('Area', destination)
        const visited = area.getVisited()

        if (!visited.includes(entity)) {
            visited.push(entity)
            area.setVisited(visited)
            action.procedure.push('locate')
            action.procedure.push('look')
        }

        // action.object.id = destination
        return {
            parent: destination,
            area: area,
            success: true,
        }
        // action.info.parent = destination
        // action.info.area = area
    }

    // fail(action, info) {
    //     info.success = false
    //     action.steps.set('move', info)
    //     action.live = false
    // }
}

module.exports = MovementSystem
