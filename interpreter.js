const {Interpreter, InterpreterError} = require('./interpreter-class')
const actions = require('./actions')
const Action = require('./action')

// const singularVerb = {
//     minObjects: 1,
//     maxObjects: 1,
//     infixes: [],
// }

// const loneVerb = {
//     minObjects: 0,
//     maxObjects: 0,
//     infixes: [],
// }

// TODO: Contexutal actions. e.g. drop x in y  = put x in y

// const verbs = {
//     put: {
//         minObjects: 2,
//         maxObjects: 2,
//         infixes: [
//             'on',
//             'in',
//         ],
//     },
//     check: {
//         minObjects: 2,
//         maxObjects: 2,
//         infixes: [
//             'with',
//         ],
//     },
//     uncheck: {
//         minObjects: 2,
//         maxObjects: 2,
//         infixes: [
//             'with',
//         ],
//     },
//     get: singularVerb,
//     take: singularVerb,
//     pick: singularVerb,
//     drop: singularVerb,
//     go: singularVerb,
//     open: singularVerb,
//     close: singularVerb,
//     read: singularVerb,
//     look: singularVerb,
//     l: singularVerb,
//     begin: loneVerb,
//     inventory: loneVerb,
//     i: loneVerb,
// }

// /* eslint-disable require-jsdoc */
// let climbObjects = function climbObjects(object, count = 0, infixes = []) {
//     count++
//     if (!object.object) {
//         return [count, infixes]
//     }
//     infixes.push(object.infix)
//     return climbObjects(object.object, count, infixes)
// }

const interpreter = new Interpreter()

interpreter.handler('noun', (node) => {
    return {
        type: 'noun',
        word: node.word,
        descriptors: [],
    }
})

interpreter.handler('noun-multiple', (node) => {
    return {
        type: 'noun-multiple',
        word: node.word,
    }
})

interpreter.handler('pronoun', (node) => {
    return {
        type: 'pronoun',
        word: node.word,
    }
})

interpreter.handler('adjective', (node) => {
    let noun = interpreter.parseNode(node.object)
    if (!noun) {
        throw new Error('adjective expected a noun')
    }
    if (noun.type === 'noun-multiple') {
        interpreter.errorMeta = {
            type: 'adjectiveNoMultiple',
            multiple: noun.word,
        }
        throw new InterpreterError('adjective can\'t use multiple nouns')
    }
    if (noun.type === 'pronoun') {
        interpreter.errorMeta = {
            type: 'adjectiveNoPronoun',
            pronoun: noun.word,
        }
        throw new InterpreterError('adjective can\'t use pronouns')
    }
    noun.descriptors.push(node.word)
    return noun
})

interpreter.handler('verb', (node) => {
    const object = interpreter.parseNode(node.object)
    if (!object) {
        throw new Error('verb expected an object')
    }

    const standards = verbs[node.word]
    if (!standards) {
        // interpreter.errorMeta = {
        //     unknownVerb: node.word,
        // }
        throw new Error(`Unknown, verb: ${node.word}`)
    }

    // const [objectCount, infixes] = climbObjects(object)
    // if (objectCount < standards.minObjects) {
    //     interpreter.errorMeta = {
    //         type: 'verbObjectCount',
    //         verb: node.word,
    //         min: standards.minObjects,
    //         count: objectCount,
    //     }
    //     throw new InterpreterError(`Verb: '${node.word}' requires at least: '${standards.minObjects}' objects. ` +
    //         `Given: '${objectCount}'`)
    // }
    // if (objectCount > standards.maxObjects) {
    //     interpreter.errorMeta = {
    //         type: 'verbObjectCount',
    //         verb: node.word,
    //         max: standards.maxObjects,
    //         count: objectCount,
    //     }
    //     throw new InterpreterError(`Verb: '${node.word}' will accept up to: '${standards.maxObjects}' objects. ` +
    //         `Given: '${objectCount}'`)
    // }
    // if (objectCount > 1) {
    //     const disallowed = infixes.filter((infix) => !standards.infixes.includes(infix))
    //     if (disallowed.length) {
    //         interpreter.errorMeta = {
    //             type: 'verbNoInfix',
    //             verb: node.word,
    //             allowed: standards.infixes,
    //             disallowed,
    //         }
    //         throw new InterpreterError(`Verb: '${node.word}' will not accept infix: '${disallowed[0]}'`)
    //     }
    // }

    const constructor = actions[node.word]
    if (!constructor) {
        // interpreter.errorMeta = {
        //     actionType: node.word,
        // }
        throw new Error(`Unknown action type: ${node.word}`)
    }
    return new constructor({ word: node.word, object})
})

interpreter.handler('verb-intransitive', (node) => {
    const constructor = actions[node.word]
    if (!constructor) {
        // interpreter.errorMeta = {
        //     actionType: node.word,
        // }
        throw new Error(`Unknown action type: ${node.word}`)
    }
    return new constructor({ word: node.word})
})

interpreter.handler('adverb', (node) => {

    let action = interpreter.parseNode(node.object)
    if (!(action instanceof Action)) {
        // interpreter.errorMeta = {
        //     noAction: action,
        // }
        throw new Error('adverb expected an action')
    }
    return action.modify(node.word)
})

interpreter.handler('preposition-adverb-postfix', (node) => {
    let action = interpreter.parseNode(node.object)
    if (!(action instanceof Action)) {
        // interpreter.errorMeta = {
        //     noAction: action,
        // }
        throw new Error('preposition-adverb-postfix expected an action')
    }
    return action.modify(node.word)
})

interpreter.handler('preposition-phrase-infix', (node) => {
    let object = interpreter.parseNode(node.direct)
    // if (!object) {
    //     // interpreter.errorMeta = {
    //     //     infixDirect: infix,
    //     // }
    //     throw new Error('preposition-phrase-infix expected a direct object')
    // }
    object.object = interpreter.parseNode(node.indirect)
    object.infix = node.word
    // if (!object.object) {
    //     // interpreter.errorMeta = {
    //     //     infixIndirect: object,
    //     // }
    //     throw new Error('preposition-phrase-infix expected an indirect object')
    // }
    if (object.object.type === 'noun-multiple') {
        interpreter.errorMeta = {
            type: 'indirectNoMultiple',
            infix: node.word,
            multiple: object.object.word,
        }
        throw new InterpreterError('preposition-phrase-infix can\'t use multiple nouns as indirect object')
    }
    return object
})

interpreter.handler('conjunction', (node) => {
    let left = interpreter.parseNode(node.left)
    let right = interpreter.parseNode(node.right)

    return {
        type: 'bifurcation',
        word: node.word,
        left,
        right,
    }
})

module.exports = {
    friendlyInterpret: (nodes) => {
        try {
            return interpreter.interpret(nodes)
        } catch (error) {
            console.log(error)
            console.log(error.isInterpretError)
            if (error.isInterpretError) {
                return [error]
            }
            throw error
        }
    },
    interpreter,
}
