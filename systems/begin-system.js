const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class BeginSystem extends System {

    update(action) {

        console.log('-------- BEGIN --------')
        action.info.parent = em.getComponent('Location', action.entity.id).getParent()
        action.steps.set('begin', {success: true})
    }

    // linkToProcess(generalInputProcess) {
    //     if (!(generalInputProcess instanceof Process)) {
    //         throw new TypeError('Argument must be an instanceof class Process.')
    //     }
    //     this.generalInputProcess = generalInputProcess
    // }
}

module.exports = BeginSystem
