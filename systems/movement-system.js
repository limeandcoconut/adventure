const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class MovementSystem extends System {

    update(action) {

        // if (!action.object.apparent) {
        //     this.fail(action, {
        //         reason: 'Inapparent.',
        //         container: action.object.container,
        //     })
        //     return
        // }

        // if (!action.object.accessible) {
        //     this.fail(action, {
        //         reason: 'Inaccessible.',
        //         container: action.object.container,
        //     })
        //     return
        // }

        console.log('-------- MOVE --------')
        if (action.object.id) {
            action.info = this.teleport(action)
        } else {
            action.info = this.move(action)
        }

        // let container = em.getComponent('Container', object)

        // if (!container) {
        //     this.fail(action, {
        //         reason: 'Not a Container.',
        //         id: action.object.id,
        //     })
        //     return
        // }

        // if (container.isMovement()) {
        //     this.fail(action, {
        //         reason: 'Already Movement.',
        //     })
        //     return
        // }

        // container.setMovement(true)

        // if (result.success) {

        // }

        action.steps.set('move', {
            success: true,
        })
    }

    teleport({entity: {id: entity}, object: {id: destination}}) {
        const location = em.getComponent('Location', entity)
        // const parent =
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
        const firstVisit = !visited.includes(entity)
        if (firstVisit) {
            visited.push(entity)
            area.setVisited(visited)
        }

        return {
            parent: destination,
            firstVisit,
        }
    }

    fail(action, info) {
        info.success = false
        // info.direction = action.object.word
        action.steps.set('move', info)
        action.live = false
    }
}

module.exports = MovementSystem
