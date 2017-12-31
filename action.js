class Action {
    constructor(type, variants) {
        this.type = type
        this.variants = variants || {}
    }

    modify(modifier) {
        let action = this.variants[modifier]
        if (!action) {
            throw new Error('No variation of action.')
        }
        action = Object.create(this.actions[action])
        action.word = `${this.word} ${modifier}`
        action.object = this.object
        return action
    }

    static setActionsManifest(actions) {
        if (typeof actions !== 'object') {
            throw new TypeError('Argument "actions" must be an object')
        }
        this.actions = actions
    }
}

module.exports = Action
