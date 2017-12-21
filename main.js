const {systemManager, entityFactory, entityManager} = require('./managers.js')
const parse = require('./parser.js')
/* eslint-disable require-jsdoc */
const {
    ObjectDescriptorComponent,
} = require('./components.js')

class InterpretorError extends Error {
}

// TODO: pronouns
// TODO: disambiguation
// TODO: auto subject assertion
// TODO: ALL, EXCEPT

// Register a factory method for creating entities
entityFactory.registerConstructor('thing', (names, descriptors) => {
    var thing = entityManager.createEntity()
    // This gives the entity a position
    // throw descriptors
    entityManager.addComponent(new ObjectDescriptorComponent(names, descriptors), thing)
    return thing
})

if (entityManager.lowestFreeId === 10) {
    // Great! This is where you create an entity 🤖
    entityFactory.createThing(['rock'], [])
    entityFactory.create('thing')(['THING', 'thing', 'thign'], [])
    entityFactory.createThing(['screw', 'fixture'], ['red', 'rusty'])
    entityFactory.createThing(['bolt', 'fixture'], ['red'])
} else {
    console.log('skipped entities')
}

module.exports = function(line) {
    let parseTree = parse(line)
    console.log(JSON.stringify(parseTree, null, 1))

    if (parseTree instanceof Error) {
        return parseTree.toString()
    }
    let response = ''
    parseTree.forEach((node) => {
        // console.log(node)
        let commandResponse
        try {
            commandResponse = parseNode(node)
            commandResponse.type = commandResponse.type
            commandResponse.action = commandResponse.action
            commandResponse.circumstances = commandResponse.circumstances
        } catch (error) {
            console.log(error)
            if (error instanceof InterpretorError) {
                commandResponse = error.toString()
            } else {
                throw error
            }
        }
        console.log(JSON.stringify(commandResponse, null, 4))
        if (typeof commandResponse !== 'undefined') {
            response += JSON.stringify(commandResponse, null, 1) + '\n'
        }
    })

    return response
}

class Action {
    constructor(action, variants) {
        this.type = 'action'
        this.action = action
        this.variants = variants || {}
    }

    modify(modifier) {
        let action = this.variants[modifier]
        if (!action) {
            throw new InterpretorError('No variation of action.')
        }
        action = Object.create(actions[action])
        action.word = `${this.word} ${modifier}`
        action.object = this.object
        action.circumstances = this.circumstances
        return action
    }
}

let get = new Action('get')

let actions = {
    get,
    take: get,
    pick: new Action('pick', {
        up: 'take',
    }),
    drop: new Action('drop'),
}

/* eslint-disable complexity */
function parseNode(node) {
    if (!node) {
        return
    }

    if (node.type === 'noun') {
        return {
            type: 'noun',
            word: node.word,
            descriptors: [],
        }
    } else if (node.type === 'noun-standin') {
        return {
            type: 'noun',
            word: 'anything',
            descriptors: [],
        }
    } else if (node.type === 'preposition-adverb-postfix') {
        let action = parseNode(node.object)
        if (!action) {
            throw new InterpretorError('preposition-adverb-prefix expected a action')
        }
        return action.modify(node.word)
    } else if (node.type === 'preposition-phrase-infix') {
        let direct = parseNode(node.direct)
        if (!direct) {
            throw new InterpretorError('preposition-phrase-infix expected a direct object')
        }
        let indirect = parseNode(node.indirect)
        if (!indirect) {
            throw new InterpretorError('preposition-phrase-infix expected a direct object')
        }
        if (!direct.id) {
            direct.id = resolveObject(direct)
        }
        if (!indirect.id) {
            indirect.id = resolveObject(indirect)
        }
        return {
            type: 'infix',
            word: node.word,
            id: -1,
            direct,
            indirect,
        }
    } else if (node.type === 'adverb') {
        let action = parseNode(node.object)
        if (!action) {
            throw new InterpretorError('adverb expected a action')
        }
        console.log(node)
        action.circumstances.push(node.word)
        return action
    } else if (node.type === 'verb') {
        let object = parseNode(node.object)
        if (!object) {
            throw new InterpretorError('verb expected an object')
        }
        if (!object.id) {
            object.id = resolveObject(object)
        }
        let action = {}
        action = Object.create(actions[node.word])
        action.object = object
        action.word = node.word
        action.circumstances = []
        return action
    } else if (node.type === 'adjective') {
        let noun = parseNode(node.object)
        if (!noun) {
            throw new InterpretorError('adjective expected a noun')
        }
        noun.descriptors.push(node.word)
        return noun
    } else if (node.type === 'conjunction') {
        let left = parseNode(node.left)
        let right = parseNode(node.right)

        if (!left.id) {
            left.id = resolveObject(left)
        }
        if (!right.id) {
            right.id = resolveObject(right)
        }

        return {
            type: 'bifurcation',
            word: node.word,
            id: -1,
            left,
            right,
        }
    }

    throw new InterpretorError('unknown node type')
    // console.log(context)
}

function resolveObject(object) {
    let descriptors = object.descriptors.slice()

    let name = object.word
    if (name === 'all' || name === 'everything') {
        if (descriptors.length) {
            throw new InterpretorError('Descriptors on "all"')
        }
        return -2
    }

    let entities = entityManager.getEntitiesWithComponent('ObjectDescriptorComponent')

    // entities = entities.map((entity) => {
    //     let component = entityManager.getComponent('ObjectDescriptorComponent', entity)
    //     return {
    //         id: entity,
    //         names: component.getNames(),
    //         descriptors: component.getDescriptors(),
    //     }
    // })

    // if (object.word !== 'anything') {
    //     // entities = entities.filter(entity => entity.names.includes(name) ? entity : null)
    // }

    // console.log('entities ', entities)

    let best = {
        entities: [],
        // Make 0 not count
        score: 1,
    }
    console.log(descriptors)
    entities.forEach((entity) => {
        let descriptorComponent = entityManager.getComponent('ObjectDescriptorComponent', entity)

        if (name !== 'anything' && !descriptorComponent.getNames().includes(name)) {
            return
        }

        let entityDescriptors = descriptorComponent.getDescriptors()
        if (descriptors.length) {
            let score = descriptors.filter(descriptor => entityDescriptors.includes(descriptor))
            score = score.length
            if (score > best.score) {
                best.score = score
                best.entities = [entity]
            } else if (score === best.score) {
                best.entities.push(entity)
            }
        } else {
            best.entities.push(entity)
        }
    })

    if (!best.entities.length) {
        throw new InterpretorError('Cannot resolve entity')
    }

    if (best.entities.length > 1) {
        throw new InterpretorError(`multiple results: ${best.entities}`)
    }

    return best.entities[0]
}
