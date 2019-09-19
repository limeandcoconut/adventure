const System = require('./system')

const {formatContents} = require('./methods')

class InventorySystem extends System {

  update(action) {
    console.log('-------- INVENTORY --------')

    action.steps.inventory = {
      success: true,
      code: 'si-ss',
      inventory: formatContents(action.entity.container.contents, action.entity),
    }
  }
}

module.exports = InventorySystem
