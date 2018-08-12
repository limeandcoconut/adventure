class Action {
    constructor({word, object}) {
        this.steps = {}
        this.live = true
        this.object = object
        this.word = word
        this.variants = {}
        // this.requirements = requirements || {
        //     LocatorSystem: {
        //         apparent: true,
        //         accessible: true,
        //     },
        // }
        // this.requiredLocal = 'present'
        // this.requiredApparent = true
    }

    modify(modifier) {
        let constructor = this.variants[modifier]
        if (!constructor) {
            throw new Error('No variation of action')
        }
        // action = Object.create(Action.actions[action])
        // let word =
        // const action =
        // Object.assign?
        // action.word = ``
        // action.object = this.object
        // action.requirements = this.requirements
        return new constructor({
            word: `${this.word} ${modifier}`,
            object: this.object,
        })
    }

    clone() {
        const clone = new this.constructor({
            word: this.word,
            object: this.object,
        })
        clone.live = this.live
        const steps = {}
        const keys = Object.keys(this.steps)
        while (keys.length) {
            let step = keys.shift()
            steps[step] = Object.assign({}, this.steps[step])
        }
        clone.steps = steps

        clone.procedure = this.procedure.slice()
        clone.reporter = this.reporter
        clone.fault = this.fault

        // clone.object = this.object
        // clone.word = this.word

        clone.bifurcated = this.bifurcated
        clone.entity = Object.assign({}, this.entity)
        clone.initiative = this.initiative

        const copy = [
            'word',
            'object',
            'live',
            'steps',
            'procedure',
            'reporter',
            'fault',
            'bifurcated',
            'entity',
            'initiative',

            'variants',
        ]
        const props = Object.keys(keys)
        while (props.length) {
            let prop = props.shift()
            if (!copy.includes(prop)) {
                throw new Error(`Need to clone: ${prop}`)
            }
        }

        return clone
        // clone.steps = JSON.parse(JSON.stringify(this.steps))
        // clone.type = type
    }

    // static setActionsManifest(actions) {
    //     if (typeof actions !== 'object') {
    //         throw new TypeError('Argument \'actions\' must be an object')
    //     }
    //     this.actions = actions
    // }
}

module.exports = Action
