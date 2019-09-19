const Process = require('../process')

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
    let actions = this.generalActionQueue
    if (actions.length) {
      console.log('-------- GENERAL PROCESS --------')
    }
    this.generalActionQueue = []
    return actions
  }
}

module.exports = GeneralInputProcess
