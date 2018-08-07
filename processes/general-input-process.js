const Process = require('../process')
const {entityManager: em} = require('../managers.js')

class GeneralInputProcess extends Process {
    constructor(generalActionQueue) {
        super()
        if (!Array.isArray(generalActionQueue)) {
            throw new TypeError('Argument must be an Array.')
        }
        this.generalActionQueue = generalActionQueue
    }

    addAction(action) {
        console.log('-------- GENERAL INPUT --------')
        this.generalActionQueue.push(action)
    }

    update() {
        console.log('-------- GENERAL PROCESS --------')
        let actions = this.generalActionQueue
        this.generalActionQueue = []
        return actions
    }
}

module.exports = GeneralInputProcess
