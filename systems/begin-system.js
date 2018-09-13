const System = require('./system')


class BeginSystem extends System {

    update(action) {

        // console.log('-------- BEGIN --------')
        action.object = {
            id: em.getComponent('Location', action.entity.id).getParent(),
        }
        action.steps.begin = {success: true}
    }

    // linkToProcess(generalInputProcess) {
    //     if (!(generalInputProcess instanceof Process)) {
    //         throw new TypeError('Argument must be an instanceof class Process.')
    //     }
    //     this.generalInputProcess = generalInputProcess
    // }
}

module.exports = BeginSystem
