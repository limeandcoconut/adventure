const System = require('./system')

class CheckSystem extends System {

    update(action) {
        let {entity: {id: entity}, object} = action
        let indirect = object.object

        if (object.id === indirect.id) {
            this.fail(action, {
                reason: 'Inceptive.',
                object: object.id,
            })
            return
        }

        if (!object.apparent) {
            this.fail(action, {
                reason: 'Inapparent.',
                object: object.id,
                container: object.container,
            })
            return
        }

        if (!object.accessible) {
            this.fail(action, {
                reason: 'Inaccessible.',
                object: object.id,
                container: object.container,
            })
            return
        }

        if (!indirect.apparent) {
            this.fail(action, {
                reason: 'Inapparent.',
                object: indirect,
                container: indirect.container,
            })
            return
        }

        if (!indirect.accessible) {
            this.fail(action, {
                reason: 'Inaccessible.',
                object: indirect,
                container: indirect.container,
            })
            return
        }

        // if (object.parent !== entity) {
        //     this.fail(action, {
        //         reason: 'Don\'t Have Object.',
        //         object: object.id,
        //     })
        //     return
        // }

        if (indirect.parent !== entity) {
            this.fail(action, {
                reason: 'Don\'t Have Indirect.',
                object: indirect.id,
            })
            return
        }

        console.log('-------- CHECK --------')

        object = object.id
        indirect = indirect.id

        const tool = em.getComponent('Tool', indirect)
        if (!tool || tool.getType() !== 'write') {
            this.fail(action, {
                reason: 'Not Tool.',
                object: indirect,
            })
            return
        }

        const option = em.getComponent('Option', object)
        const value = option.getValue()

        const desired = action.desired
        if (value === desired) {
            this.fail(action, {
                reason: 'Already Done.',
                value,
            })
            return
        }

        option.setValue(desired)

        action.steps.check = {
            success: true,
            value: desired,
        }
    }

    fail(action, info) {
        info.success = false
        info.id = action.object.id
        action.steps.check = info
        action.live = false
        action.fault = 'check'
    }
}

module.exports = CheckSystem
