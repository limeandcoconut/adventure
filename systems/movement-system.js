const System = require('./system')

const {put} = require('./methods')

class MovementSystem extends System {

    update(action) {

        // console.log('-------- MOVE --------')
        let info

        if (action.object.id) {
            // Teleport.
            // let {entity, object} = action
            info = this.goTo(action.object, action.entity.location.parent, action.entity, action)
        } else {
            info = this.move(action)
        }

        action.steps.move = info
        if (!info.success) {
            action.live = false
            action.fault = 'move'
        }
    }

    // teleport(action) {
    // }

    move(action) {
        let {entity, object: {value: direction}} = action
        const parent = entity.location.parent

        // Distill direction character codes.
        direction = direction.match(/^(n)?(?:orth)?(s)?(?:outh)?(e)?(?:ast)?(w)?(?:est)?$|^(d)?(?:own)?$|^(u)?(?:p)?$/)
        direction = direction.slice(1, 7).join('')

        let destination = parent.area.doors[direction]
        if (!destination) {
            return {
                reason: 'No Door.',
                code: 'sm-nd',
                direction,
                success: false,
            }
        }

        action.object = destination
        const info = this.goTo(destination, parent, entity, action)
        info.direction = direction
        return info
    }

    goTo(destination, parent, entity, action) {

        const putResult = put(entity, parent, destination)
        if (putResult) {
            putResult.success = false
            return putResult
        }

        const visited = destination.area.visited
        if (!visited.includes(entity)) {
            visited.push(entity)
            // action.procedure.push('locate')
            action.procedure.push('look')
        }

        return {
            // TODO: Parent probably isnt needed.
            parent: destination,
            area: destination.area,
            code: 'sm-ss',
            success: true,
        }
    }
}

module.exports = MovementSystem
