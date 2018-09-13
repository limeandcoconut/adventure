const System = require('./system')

const {put} = require('./methods')

class MovementSystem extends System {

    update(action) {

        // console.log('-------- MOVE --------')
        let info

        if (action.object.id) {
            info = this.teleport(action)
        } else {
            info = this.move(action)
        }

        action.steps.move = info
        if (!info.success) {
            action.live = false
            action.fault = 'move'
        }
    }

    teleport(action) {
        let {entity: {id: entity}, object: {id: destination}} = action

        return this.goTo(em.getComponent('Location', entity).getParent(), destination, entity, action)
    }

    move(action) {
        let {entity: {id: entity}, object: {word: direction}} = action
        const parent = em.getComponent('Location', entity).getParent()

        let doors = em.getComponent('Area', parent).getDoors()
        direction = direction.match(/^(n)?(?:orth)?(s)?(?:outh)?(e)?(?:ast)?(w)?(?:est)?$|^(d)?(?:own)?$|^(u)?(?:p)?$/)
        direction = direction.slice(1, 7).join('')

        let destination = doors[direction]

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
        if (em.getComponent('ObjectProperties', entity).isFixture()) {
            return {
                success: false,
                reason: 'Fixture.',
            }
        }

        const putResult = put(entity, parent, destination)
        if (putResult) {
            putResult.success = false
            return putResult
        }

        const area = em.getComponent('Area', destination)
        const visited = area.getVisited()

        if (!visited.includes(entity)) {
            visited.push(entity)
            area.setVisited(visited)
            action.procedure.push('locate')
            action.procedure.push('look')
        }

        return {
            parent: destination,
            area: area,
            success: true,
        }
    }
}

module.exports = MovementSystem
