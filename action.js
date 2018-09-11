class Action {
    constructor(verb) {
        let {text, object} = verb
        this.steps = {}
        this.live = true
        this.object = object
        this.word = text
        this.verb = verb
        // this.variants = {}
    }

    // validateObjects() {
    //     for (let i = 0; i < this.objectTypes.length; i++) {
    //         const type = this.objectTypes[i]
    //         const context = this.context[type]
    //         if (context) {
    //             if (!this[type]) {
    //                 if (!context.resolve) {
    //                     throw new Error(`av1: Action can't auto resolve: ${type}`)
    //                 }
    //                 const targets = context.resolve(this)
    //                 if (!targets.length) {
    //                     throw new Error(`av2: Action failed to resolve type: ${type}`)
    //                 }
    //                 if (targets.length > 1) {
    //                     throw new Error(`av3: Action has multiple plausible targets: ${type}`)
    //                 }
    //                 this[type] = targets[0]
    //                 return
    //             }
    //         } else if (this[type]) {
    //             throw new Error(`av4: Action can't accept object type: ${type}`)
    //         }
    //     }
    // }

    static delegate(verb) {
        const key = verb.modifiers.sort().join()
        const constructor = this.prototype.variants && this.prototype.variants[key]

        if (!constructor) {
            throw new Error('adg1: No variation of action')
        }

        return new constructor(verb)
    }

    // modify(modifier) {
    //     // let constructor = this.variants[modifier]
    //     // if (!constructor) {
    //     //     throw new Error('No variation of action')
    //     // }

    //     // return new constructor({
    //     //     word: `${this.word} ${modifier}`,
    //     //     object: this.object,
    //     // })
    // }

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
        clone.fault = this.faul

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
    }
}

Action.prototype.variants = {}
Action.prototype.context = new Map([
    ['object', false],
    ['indirect', false],
    ['tool', false],
])
// Action.prototype.objectTypes = Object.freeze([
//     'object',
//     'indirect',
//     'tool',
//     'from',
// ])

module.exports = Action
