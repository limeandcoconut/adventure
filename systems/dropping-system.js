const System = require('./system')

const {put} = require('./methods')

class DroppingSystem extends System {

  update(action) {
    const {entity, object} = action
    if (object.location.parent !== entity) {
      this.fail(action, {
        reason: 'Don\'t have.',
        code: 'sd-dh',
      })
      return
    }

    if (object.properties.fixture) {
      this.fail(action, {
        reason: 'Fixture.',
        code: 'gx-ft',
        object,
      })
      return
    }

    if (object.properties.part) {
      this.fail(action, {
        reason: 'Part.',
        code: 'gx-pt',
        object,
      })
      return
    }

    // console.log('-------- DROP --------')

    // const source = entity
    // const destination = entity.location.parent

    let result = put(object, entity, entity.location.parent)
    if (result) {
      this.fail(action, result)
      return
    }

    action.steps.drop = {
      success: true,
      code: 'sd-ss',
    }
  }

  fail(action, info) {
    info.success = false
    // info.id = action.object.id
    action.steps.drop = info
    action.live = false
    action.fault = 'drop'
  }
}

module.exports = DroppingSystem
