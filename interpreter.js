const {Interpreter, InterpreterError} = require('./interpreter-class')
const actions = require('./actions')
const Action = require('./action')

const interpreter = new Interpreter()

interpreter.handler('noun', (node) => {
    return {
        type: 'noun',
        word: node.word,
        descriptors: [],
    }
})

interpreter.handler('adjective', (node) => {
    let noun = interpreter.parseNode(node.object)
    if (!noun) {
        throw new InterpreterError('Adjective expected a noun.')
    }
    noun.descriptors.push(node.word)
    return noun
})

interpreter.handler('verb', (node) => {
    let object = interpreter.parseNode(node.object)
    if (!object) {
        throw new InterpreterError('Verb expected an object.')
    }

    // TODO: Why is this initialization here?
    let action = {}
    action = Object.create(actions[node.word])
    action.word = node.word
    action.object = object
    return action
})

interpreter.handler('verb-intransitive', (node) => {
    let action = {}
    action = Object.create(actions[node.word])
    action.word = node.word
    return action
})

interpreter.handler('adverb', (node) => {

    let action = interpreter.parseNode(node.object)
    if (!(action instanceof Action)) {
        throw new InterpreterError('Adverb expected an action.')
    }
    return action.modify(node.word)
})

interpreter.handler('preposition-adverb-postfix', (node) => {
    let action = interpreter.parseNode(node.object)
    if (!(action instanceof Action)) {
        throw new InterpreterError('preposition-adverb-postfix expected an action.')
    }
    return action.modify(node.word)
})

interpreter.handler('preposition-phrase-infix', (node) => {
    let direct = interpreter.parseNode(node.direct)
    if (!direct) {
        throw new InterpreterError('preposition-phrase-infix expected a direct object.')
    }
    let indirect = interpreter.parseNode(node.indirect)
    if (!indirect) {
        throw new InterpreterError('preposition-phrase-infix expected an indirect object.')
    }
    return {
        type: 'infix',
        word: node.word,
        direct,
        indirect,
    }
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

// function parseNode(node) {
//     if (!node) {
//         return
//     }

//     switch (node.type) {
//         case 'noun': {

//             return {
//                 type: 'noun',
//                 word: node.word,
//                 descriptors: [],
//             }
//         }
//         case 'preposition-adverb-postfix': {
//             let action = parseNode(node.object)
//             if (!action) {
//                 throw new Error('preposition-adverb-postfix expected a action')
//             }
//             return action.modify(node.word)
//         }
//         case 'preposition-phrase-infix': {
//             let direct = parseNode(node.direct)
//             if (!direct) {
//                 throw new Error('preposition-phrase-infix expected a direct object')
//             }
//             let indirect = parseNode(node.indirect)
//             if (!indirect) {
//                 throw new Error('preposition-phrase-infix expected a direct object')
//             }
//             // if (!direct.id) {
//             // direct.id = resolveObject(direct)

//             // }
//             // if (!indirect.id) {
//             // indirect.id = resolveObject(indirect)
//             // }
//             return {
//                 type: 'infix',
//                 word: node.word,
//                 // id: -1,
//                 direct,
//                 indirect,
//                 // objects: [direct, indirect],
//             }
//         }
//         case 'adverb': {
//             // let action = parseNode(node.object)
//             // if (!action) {
//             //     throw new Error('Adverb expected a action.')
//             // }
//             // action.circumstances.push(node.word)
//             // return action

//             let action = parseNode(node.object)
//             if (!action) {
//                 throw new Error('Adverb expected a action.')
//             }
//             return action.modify(node.word)
//         }
//         case 'verb': {
//             let object = parseNode(node.object)
//             if (!object) {
//                 throw new Error('verb expected an object')
//             }
//             console.log(actions[node.word])
//             let action = {}
//             action = Object.create(actionTypes[node.word])
//             action.word = node.word
//             // action.circumstances = []

//             // if (action.resolve) {
//             //     if (object.objects) {
//             //         object.objects.forEach((object) => {
//             //             object.id = resolveObject(object)
//             //         })
//             //     } else {
//             //         object.id = resolveObject(object)
//             //     }
//             // }

//             action.object = object
//             return action
//         }
//         case 'verb-intransitive': {
//             // let object = parseNode(node.object)
//             // if (!object) {
//             //     throw new Error('verb expected an object')
//             // }
//             // if (!object.id) {
//             //     object.id = resolveObject(object)
//             // }
//             let action = {}
//             action = Object.create(actionTypes[node.word])
//             // action.object = object
//             action.word = node.word
//             // action.circumstances = []
//             return action
//         }
//         case 'adjective': {
//             let noun = parseNode(node.object)
//             if (!noun) {
//                 throw new Error('adjective expected a noun')
//             }
//             noun.descriptors.push(node.word)
//             return noun
//         }
//         case 'conjunction': {
//             let left = parseNode(node.left)
//             let right = parseNode(node.right)

//             // if (!left.id) {
//             //     left.id = resolveObject(left)
//             // }
//             // if (!right.id) {
//             //     right.id = resolveObject(right)
//             // }

//             return {
//                 type: 'bifurcation',
//                 word: node.word,
//                 // id: -1,
//                 left,
//                 right,
//                 // objects: [left, right],
//             }
//         }
//         default:
//             throw new Error('unknown node type')
//     }

// }

