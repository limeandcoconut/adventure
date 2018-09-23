// const {parser, lexer} = require('./parser')
// const {interpreter} = require('./interpreter')
/* eslint-disable require-jsdoc, complexity */

function describeContents({contents, opening = 'a ', closing = '', level = 0}) {
    let tab = '    '
    let indent = tab.repeat(level)
    let output = ''
    if (contents.length) {
        if (level) {
            output += `${indent}It contains:\n`
        }
    }
    for (let i = 0; i < contents.length; i++) {
        const {id, contents: itemContents} = contents[i]
        const name = em.getComponent('Descriptors', id).getName()
        output += `${tab}${indent}${opening}${name}${closing}\n`

        if (itemContents) {
            output += describeContents({
                contents: itemContents,
                level: level + 1,
            })
        }
    }

    return output
}

const missingParseParts = {
    'conjunction': 'noun',
    'verb': 'noun',
    'adverb': 'verb',
    'preposition-adverb-postfix': 'verb',
    'preposition-phrase-infix': 'noun',
}

const responses = {
    errors: {
        lexer: {
            unknownWord({word}) {
                return `I'm sorry, I don't know the word "${word}".`
            },
            unknownChar({char}) {
                return `I'm sorry, I don't know what "${char}" means.`
            },
        },
        parser: {
            unexpectedToken({token, binder}) {
                const type = binder ? binder.type : token.type
                const missing = missingParseParts[type]
                if (missing) {
                    return `There seems to be an ${missing} missing from that sentence.`
                }
                if (token.type !== parser.endToken) {
                    return `I don't understand how you used the word "${token.word}".`
                }
            },
        },
        interpreter: {
            adjectiveNoMultiple({multiple}) {
                return `You can't use adjectives with the multiple noun '${multiple}'.`
            },
            adjectiveNoPronoun({pronoun}) {
                return `You can't use adjectives with the pronoun '${pronoun}' like that.`
            },
            verbObjectCount({verb, min, max, count}) {
                if (typeof min !== 'undefined') {
                    return `I don't know how to '${verb}' with only ${count} object${count > 1 ? 's' : ''}.`
                }
                return `I don't know how to '${verb}' ${count - 1} indirect object${count > 2 ? 's' : ''}.`
            },
            verbNoInfix({verb, disallowed: [disallowed]}) {
                return `I don't know how to '${verb}' '${disallowed}' something`
            },
            indirectNoMultiple({infix, multiple}) {
                return `You can't use the multiple noun '${multiple}' as an indirect object like that.`
            },
        },
        general: {
            understandSentence() {
                return `That sentence isn't one I recognize`
            },
            fatal() {
                return `Well it looks like this one is on me. ` +
                    `Something terrible just happened and it doesn't look like we can fix it.`
            },
        },
    },
    steps: {
        resolve({live, steps: {resolve: {reason, object, objects}}}) {
            if (live) {
                return
            }
            if (/cannot/i.test(reason)) {
                return `I don't see any ${object}.`
            }
            if (/multiple/i.test(reason)) {
                let names = objects.map((object) => em.getComponent('Descriptors', object).getName())
                let last = names.pop()
                names = names.join(', ')
                names += ', or the ' + last
                return `Do you mean the ${names}?`
            }
        },
        preresolve({live, steps: {preresolve: {reason}}}) {
            // return 'I don\'t see anything.'
            if (live) {
                return
            }
            return reason
        },
        get({live, steps: {get: {reason}}}) {
            if (live) {
                return 'Taken.'
            }
            if (/have/i.test(reason)) {
                return 'You already have that.'
            }
        },
        drop({live, steps: {drop: {reason}}}) {
            if (live) {
                return 'Dropped.'
            }
            if (/don.?t/i.test(reason)) {
                return `You don't have that`
            }
        },
        inventory({live, steps: {inventory: {inventory}}}) {
            if (!live) {
                return
            }
            if (!inventory.length) {
                return `You don't have anything.`
            }

            let output = `You are carrying:\n`
            output += describeContents({contents: inventory})
            return output
        },
        open({live, steps: {open: {reason, id}}}) {
            if (live) {
                return 'Opened.'
            }
            if (/already/i.test(reason)) {
                return 'It\'s already open.'
            }
            if (/not.*container/i.test(reason) || /surface/i.test(reason)) {
                let name = em.getComponent('Descriptors', id).getName()
                return `How do you open a ${name}?`
            }
        },
        close({live, steps: {close: {reason, id}}}) {
            if (live) {
                return 'Opened.'
            }
            if (/already/i.test(reason)) {
                return 'It\'s already closed.'
            }
            if (/not.*container/i.test(reason) || /surface/i.test(reason)) {
                let name = em.getComponent('Descriptors', id).getName()
                return `How do you close a ${name}?`
            }
        },
        move(action) {
            const {live, steps: {move: {reason, direction, area}, look}} = action
            if (live) {
                if (look) {
                    return responses.steps.look(action)
                }
                return `- ${area.getTitle()} -\n`
            }
            if (/no.*door/i.test(reason)) {
                let directions = {
                    n: 'north',
                    s: 'south',
                    e: 'east',
                    w: 'west',
                    u: 'up',
                    d: 'down',
                    ne: 'northeast',
                    nw: 'northwest',
                    se: 'southeast',
                    sw: 'southwest',
                }
                return `There's no way to go ${directions[direction]}.`
            }
        },
        begin(action) {
            if (!action.live) {
                return
            }
            return '\n \nYou\'re in a room, utterly boring with just a hint of institutionalized over optimism. ' +
                'It\'s a small kindness not to describe the nearly blank nearly white walls and other environs ' +
                'in any detail. ' +
                'A cloying sense of insincerity pervades this place. Florescent lights hum overhead... \n' +
                'You notice a sign on the wall that has been laminated so that the paper is ever so slightly ' +
                'askew within the plastic coating - ' +
                'it would seem that such things are never perfect. It reads:' +
                '\n \n######################################\n \n' +
                'WELCOME TO THE TESTING AREA:\n' +
                'Congratulations on your new position!\n' +
                'This environment promotes fun and cooperation.\n \n' +
                '######################################\n \n' +
                'You can feel the ennui setting in already.\n \n' +
                responses.steps.look(action)
        },
        look(action) {
            const {live, steps: {look: {object, area, contents}, read}} = action
            if (!live) {
                return
            }
            // const  = steps
            let output = ''
            const context = {contents}
            if (area) {
                output += `\n- ${area.getTitle()} -\n `
                context.opening = 'There is a '
                context.closing = ' here.'
            }
            output += `\n${em.getComponent('Appearance', object).getAppearance()}\n`
            if (read) {
                output += 'It reads:\n \n'
                output += responses.steps.read(action)
            }

            if (contents && contents.length) {
                if (!area) {
                    output += `It contains:\n`
                }
                output += describeContents(context)
            }
            return output
        },
        put(action) {
            let {live, steps: {put: {reason, object, container, destination}, get}} = action
            let output = ''
            if (get) {
                output += responses.steps.get(action)
                output += ' \n'
            }
            if (live) {
                return output + 'Done.'
            }
            console.log(JSON.stringify(action.steps, null, 4))
            console.log(JSON.stringify(action.steps.put, null, 4))
            container = container || destination
            object = em.getComponent('Descriptors', object).getName()
            if (/inceptive/i.test(reason)) {
                return output + `You can't put a ${object} inside itself!`
            }
            // object = em.getComponent('Descriptors', object).getName()
            if (container) {
                container = em.getComponent('Descriptors', container).getName()
            }
            if (/big/i.test(reason)) {
                return output + `The ${object} is too big for the ${container}.`
            }
            if (/closed/i.test(reason)) {
                return `The ${container} is closed.`
            }
            if (/heavy/i.test(reason)) {
                return output + `The ${object} is just too heavy for the ${container}.`
            }
            if (output.length) {
                return output + reason
            }
        },
        read({live, steps: {read: {text, reason}}}) {
            if (live) {
                return `"${text}"`
            }
            if (/read/i.test(reason)) {
                return `It doesn't say anything.`
            }
        },
        check({live, steps: {check: {reason, object, value}}}) {
            if (live) {
                return value ? 'Checked.' : 'Unchecked.'
            }
            if (/don.*t.*have/i.test(reason)) {
                const name = em.getComponent('Descriptors', object).getName()
                return `You don't have the ${name}.`
            }
            if (/tool/i.test(reason)) {
                const name = em.getComponent('Descriptors', object).getName()
                return `I don't know how you do that with a ${name}.`
            }
            if (/already/i.test(reason)) {
                return `It's already ${value ? 'checked' : 'unchecked'}.`
            }
        },
    },
    general(action) {
        let {steps, fault} = action
        if (fault) {
            let {reason, id, object, container, destination} = steps[fault]
            if (/inapparent/i.test(reason)) {
                let name = em.getComponent('Descriptors', id).getName()
                return `You don't see any ${name} here.`
            }
            let objectName
            if (typeof object !== 'undefined') {
                objectName = em.getComponent('Descriptors', object).getName()
            }
            if (/inceptive/i.test(reason)) {
                let word = 'It'
                if (objectName) {
                    word = 'The ' + objectName
                }
                return `The ${word} can't do that to itself!`
            }

            if (/big/i.test(reason)) {
                let objectWord = 'It\'s'
                if (objectName) {
                    objectWord = `The ${objectName} is`
                }
                let destinationWord = ''
                if (typeof destination !== 'undefined') {
                    destinationWord = ' in the ' + em.getComponent('Descriptors', destination).getName()
                }
                return `${objectWord} too big to fit${destinationWord}.`
            }
            if (/heavy/i.test(reason)) {
                let objectWord = 'It\'s'
                if (objectName) {
                    objectWord = `The ${objectName} is`
                }
                let containerWord = ''
                if (typeof container !== 'undefined') {
                    containerWord = ' for the ' + em.getComponent('Descriptors', container).getName()
                }
                return `${objectWord} too heavy${containerWord}.`
            }

            if (/inaccessible/i.test(reason)) {
                let name = em.getComponent('Descriptors', container).getName()
                return `The ${name} is closed.`
            }

            if (/fixture/i.test(reason)) {
                return `You can't move the ${objectName}.`
            }

            const word = fault.replace(/^\w/, (c) => c.toUpperCase())
            return `${word} Nope.`
        }
        const word = action.type.replace(/^\w/, (c) => c.toUpperCase())
        return `${word}, done.`
    },
    noInput() {
        return 'Beg your pardon?'
    },
}

// const machines = {
//     lexer,
//     parser,
//     interpreter,
// }

function formatResponse(output) {
    // Errors:
    if (output instanceof Error) {
        // const {code, meta} = output
        // let errorClass = Object.keys(output).reduce((str, key) => (key.match(/is(.*?)e?Error/i) || [])[1], '')
        // errorClass += 'er'
        // errorClass = errorClass.toLowerCase()
        // if (!errorClass) {
        //     return responses.errors.general.fatal()
        // }
        // const errorMeta = machines[errorClass].errorMeta
        const handler = responses.errors[output.code]
        const response = handler(output)
        if (response) {
            return response
        }

        return responses.errors.general.understandSentence()
    }

    // If there was no recognized input.
    if ((typeof output === 'string' || Array.isArray(output)) && !output.length) {
        return responses.noInput()
    }

    let handler = output.live ? output.reporter : output.fault
    handler = responses.steps[handler]
    if (handler) {
        const response = handler(output)
        if (response) {
            return response
        }
    }

    return responses.general(output)
}

module.exports = formatResponse
