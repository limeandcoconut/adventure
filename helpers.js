
const helpers = {
  // formatContents(contents, entity) {

  //     contents = Array.from(contents)
  //     console.log(contents)
  //     const newContents = []
  //     for (let i = 0; i < contents.length; i++) {
  //         const id = contents[i]

  //         // }
  //         // contents = contents.map((id) => {
  //         let properties = em.getComponent('ObjectProperties', id)
  //         console.log('HERE')
  //         throw 'here'
  //         console.log(properties && !properties.isVisible())
  //         if (id === entity || (properties && !properties.isVisible())) {
  //             continue
  //         }
  //         let item = {
  //             id,
  //         }
  //         let container = em.getComponent('Container', id)
  //         if (container && (container.isOpen() || (properties && properties.isTransparent()))) {
  //             item.contents = helpers.formatContents(container.getContents(), entity)
  //         }
  //         newContents.push(item)
  //     }

  //     return newContents
  // },
  logAction(action) {
    // let steps = action.steps
    // if (steps) {
    //     steps = Array.from(action.steps)
    // }
    // action = JSON.parse(JSON.stringify(action))
    console.log(JSON.stringify(action, null, 2))
    // action.steps = steps
    // if (steps) {
    //     console.log(JSON.stringify(steps, null, 2))
    // }
  },
}

module.exports = helpers
