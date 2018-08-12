class Action {
    constructor({type, procedure, reporter, variants, requirements}) {
        this.type = type
        this.procedure = procedure
        this.reporter = reporter
        this.variants = variants || {}
        this.requirements = requirements || {
            LocatorSystem: {
                apparent: true,
                accessible: true,
            },
        }
        // this.requiredLocal = 'present'
        // this.requiredApparent = true
    }

    modify(modifier) {
        let action = this.variants[modifier]
        if (!action) {
            throw new Error('No variation of action')
        }
        action = Object.create(Action.actions[action])
        // Object.assign?
        action.word = `${this.word} ${modifier}`
        action.object = this.object
        action.requirements = this.requirements
        return action
    }

    static setActionsManifest(actions) {
        if (typeof actions !== 'object') {
            throw new TypeError('Argument \'actions\' must be an object')
        }
        this.actions = actions
    }
}

module.exports = Action
