const System = require('./system')

class BeginSystem extends System {

    update(action) {

        // console.log('-------- BEGIN --------')
        console.log(action)
        action.object = action.entity.location.parent
        action.steps.begin = {success: true, code: 'sb-ss'}
    }

    // linkToProcess(generalInputProcess) {
    //     if (!(generalInputProcess instanceof Process)) {
    //         throw new TypeError('Argument must be an instanceof class Process.')
    //     }
    //     this.generalInputProcess = generalInputProcess
    // }
}

module.exports = BeginSystem
