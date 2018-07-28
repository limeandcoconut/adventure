const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class PlayerInputSystem extends System {
    constructor() {
        super()
        this.requiredComponents = ['PlayerInput']
    }

    update() {
        em.getEntitiesWithComponent('PlayerInput').forEach((entity) => {
            let playerInput = em.getComponent('PlayerInput', entity)
            let queue = playerInput.getQueue()

            let action = queue.pop()

            if (!action) {
                return
            }

            action.
        })
    }
}

module.exports = PlayerInputSystem

