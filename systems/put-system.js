const System = require('./system')
const {put} = require('./methods')

class PutSystem extends System {

  update(action) {
    let {entity, object, indirect} = action

    if (object === indirect) {
      this.fail(action, {
        reason: 'Inceptive.',
        code: 'sp-iv',
        object,
      })
      return
    }

    // console.log('---------- PUT ---------')

    if (object.location.parent !== entity) {
      // TODO: [>=0.1.0] Maybe these should be put into different actions.
      action.procedure.push('get')
      action.procedure.push('put')
      return
    }

    let result = put(object, entity, indirect)
    if (result) {
      this.fail(action, result)
      return
    }

    action.steps.put = {
      success: true,
      code: 'sp-ss',
    }
  }

  fail(action, info) {
    info.success = false
    // info.id = info.object
    action.steps.put = info
    action.live = false
    action.fault = 'put'
  }
}

module.exports = PutSystem
