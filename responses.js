// const {parser, lexer} = require('./parser')
// const {interpreter} = require('./interpreter')
/* eslint-disable require-jsdoc, complexity */
// const {formatContents} = require('./systems/methods.js')
// const entities = require('./entities')

function describeContents({contents, opening = 'a ', closing = '', level = 0}) {
    let tab = '    '
    let indent = tab.repeat(level)
    let output = ''
    if (!level) {
        let c = contents.map(simplify)
        console.log(JSON.stringify(c, null, 4))
    }
    if (contents.length) {
        if (level) {
            output += `${indent}It contains:\n`
        }
        for (let i = 0; i < contents.length; i++) {
            const {object, contents: itemContents} = contents[i]
            const name = object.descriptors.name
            output += `${indent}${tab}${opening}${name}${closing}\n`

            if (itemContents) {
                output += describeContents({
                    contents: itemContents,
                    level: level + 1,
                })
            }
        }
    }

    return output
}

function simplify({object, contents}) {
    if (contents && contents.length) {
        contents = contents.map(simplify)
    }
    return {object: object.id, contents}
}

// function describeOption(option) {
//     return `It is ${option ? 'checked' : 'unchecked'}.`
// }

function outputText(text) {
    return `"${text}"`
}

function describeObject(info) {
    // console.log(info)
    const {appearance, area, contents, option, text, parts} = info
    let output = ''
    const context = {
        contents,
    }
    if (area) {
        output += `\n- ${area.title} -\n `
        context.opening = 'There is a '
        context.closing = ' here.'
    }
    output += `\n${appearance}\n`
    if (text) {
        output += 'It reads:\n \n'
        output += outputText(text)
    }
    if (option) {
        output += `It is ${option.value ? 'checked' : 'unchecked'}.`
    }
    if (contents && contents.length) {
        if (!area) {
            output += `It contains:\n`
        }
        output += describeContents(context)
    }
    if (parts) {
        while (parts.length) {
            const part = parts.shift()
            output += `\n \nYou notice the ${part.object.descriptors.name}:\n \n`
            output += describeObject(part)
        }
    }
    return output
}

// const missingParseParts = {
//     'conjunction': 'noun',
//     'verb': 'noun',
//     'adverb': 'verb',
//     'preposition-adverb-postfix': 'verb',
//     'preposition-phrase-infix': 'noun',
// }

const responses = {
    errors: {
        aor1({meta: {verb, type}}) {
            return `I don't know how to '${verb}' using a '${type === 'object' ? 'direct' : 'indirect'}' object in that way`
        },
        oar1() {
            return 'I\'m not sure what you\'re looking for.'
        },
        aro2({meta: {noun}}) {
            return `You can't use the multiple noun '${noun.value}' as an indirect object like that.`
        },
        aor3() {
            return 'With what?'
        },
        aor4({meta: {verb}}) {
            return `I don't know how to '${verb}' multiple indirect objects.`
        },
        aor5({meta: {noun, action}}) {
            if (action.type === 'drop') {
                return `You don't have a ${noun.value}.`
            }
            return `I don't see any ${noun.value}.`
        },
        aor6({meta: {candidates}}) {
            let names = candidates.map((object) => object.descriptors.name)
            const last = names.pop()
            names = names.join(', ')
            names += ', or the ' + last
            return `Do you mean the ${names}?`
        },
        aor7({meta: {verb, type}}) {
            return `I don't know how to use a ${type} noun with the verb "${verb}".`
        },
        aor8({meta: {object}}) {
            return `You can't touch the ${object.descriptors.name}.`
        },
        aor9() {
            return 'There\'s nothing here. What were you looking for?'
        },
        lis1({message, offset}) {
            const col = message.match(/line\s\d+\scol\s(\d+)/i)[1]
            let capture = new RegExp(`\\n\\n\\s+.{${col - 1}}(.)`)
            capture = message.match(capture)
            if (!capture) {
                return
            }
            const char = capture[1]
            if (!char) {
                return
            }
            return `I'm sorry, I don't know what "${char}" means.`
        },
        lis2({message}) {
            const word = message.match(/unexpected\sword\stoken:\s+"(.*?)"/i)[1]
            return `I'm sorry, I don't know the word "${word}".`
        },
        lis3({message}) {
            const match = message.match(/Unexpected\s(\w*?)\stoken:\s+"(.*?)"/)
            const word = match[2]
            let type = match[1]
            type = /^[a-z]$/.test(type) ? type : 'word'
            return `I don't understand how you used the ${type} "${word}".`
        },

        // lexer: {
        // unknownWord({word}) {
        //     return `I'm sorry, I don't know the word "${word}".`
        // },
        // unknownChar({char}) {
        //     return `I'm sorry, I don't know what "${char}" means.`
        // },
        // },
        // parser: {
        //     unexpectedToken({token, binder}) {
        //         const type = binder ? binder.type : token.type
        //         const missing = missingParseParts[type]
        //         if (missing) {
        //             return `There seems to be an ${missing} missing from that sentence.`
        //         }
        //         if (token.type !== parser.endToken) {
        //             return `I don't understand how you used the word "${token.word}".`
        //         }
        //     },
        // },
        // interpreter: {
        // adjectiveNoMultiple({multiple}) {
        //     return `You can't use adjectives with the multiple noun '${multiple}'.`
        // },
        // adjectiveNoPronoun({pronoun}) {
        //     return `You can't use adjectives with the pronoun '${pronoun}' like that.`
        // },
        // verbObjectCount({verb, min, max, count}) {
        //     if (typeof min !== 'undefined') {
        //         return `I don't know how to '${verb}' with only ${count} object${count > 1 ? 's' : ''}.`
        //     }
        //     return `I don't know how to '${verb}' ${count - 1} indirect object${count > 2 ? 's' : ''}.`
        // },
        // verbNoInfix({verb, disallowed: [disallowed]}) {
        //     return `I don't know how to '${verb}' '${disallowed}' something`
        // },
        // indirectNoMultiple({infix, multiple}) {
        //     return `You can't use the multiple noun '${multiple}' as an indirect object like that.`
        // },
        // },
        general: {
            understandSentence() {
                return `That sentence isn't one I recognize`
            },
            fatal() {
                return 'Well it looks like this one is on me. ' +
                    'Something terrible just happened and it doesn\'t look like we can fix it.'
            },
        },
    },
    steps: {
        // resolve({steps: {resolve: {reason, object, objects}}}) {
        //     if (live) {
        //         return
        //     }
        //     if (/cannot/i.test(reason)) {
        //         return `I don't see any ${object}.`
        //     }
        //     if (/multiple/i.test(reason)) {
        //         let names = objects.map((object) => em.getComponent('Descriptors', object).getName())
        //         let last = names.pop()
        //         names = names.join(', ')
        //         names += ', or the ' + last
        //         return `Do you mean the ${names}?`
        //     }
        // },
        // preresolve({live, steps: {preresolve: {reason}}}) {
        //     // return 'I don\'t see anything.'
        //     if (live) {
        //         return
        //     }
        //     return reason
        // },
        get({steps: {get: {code}}}) {
            if (code === 'sg-ss') {
                return 'Taken.'
            }
            if (code === 'sg-ax') {
                return 'You already have that.'
            }
        },
        drop({steps: {drop: {code}}}) {
            if (code === 'sd-ss') {
                return 'Dropped.'
            }
            if (code === 'sd-dh') {
                return 'You don\'t have that.'
            }
        },
        inventory({steps: {inventory: {inventory, code}}}) {
            if (code !== 'si-ss') {
                return
            }
            if (!inventory.length) {
                return 'You don\'t have anything.'
            }

            let output = `You are carrying:\n`
            output += describeContents({contents: inventory})
            return output
        },
        open({steps: {open: {code}}, object, desired}) {
            if (code === 'so-ss') {
                return desired ? 'Opened.' : 'Closed.'
            }
            if (code === 'so-ax') {
                return `It's already ${desired ? 'open' : 'closed'}.`
            }
            if (code === 'so-nc' || code === 'so-cs') {
                return `How do you ${desired ? 'open' : 'close'} a ${object.descriptors.name}?`
            }
        },
        move(action) {
            const {steps: {move: {direction, area, code}, look}} = action
            if (code === 'sm-ss') {
                if (look) {
                    return responses.steps.look(action)
                }
                return `- ${area.title} -\n`
            }
            if (code === 'sm-nd') {
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
            // I think this might be in error.
            if (action.code === 'sb-ss') {
                return
            }
            console.log(action)
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
            const {steps: {look: info}} = action

            if (info.code !== 'sl-ss') {
                return
            }

            return describeObject(info)
        },
        put(action) {
            let {steps: {put: {code, object}, get}} = action
            let output = ''
            if (get) {
                output += responses.steps.get(action)
                output += ' \n'
            }
            if (code === 'sp-ss') {
                return output + 'Done.'
            }
            // console.log(JSON.stringify(action.steps, null, 4))
            // console.log(JSON.stringify(action.steps.put, null, 4))
            // container = container || destination
            if (code === 'sp-iv') {
                return output + `You can't put a ${object.descriptors.name} inside itself!`
            }
            // object = em.getComponent('Descriptors', object).getName()
            // if (container) {
            //     container = container.descriptors.name
            // }
            // if (code) {
            //     return output + `The ${object} is too big for the ${container}.`
            // }
            // if (/closed/i.test(reason)) {
            //     return `The ${container} is closed.`
            // }
            // if (/heavy/i.test(reason)) {
            //     return output + `The ${object} is just too heavy for the ${container}.`
            // }
            // if (output.length) {
            //     return output + reason
            // }
        },
        read({steps: {read: {object, code}}}) {
            if (code === 'sr-ss') {
                return outputText(object.text.text)
            }
            if (code === 'sr-nr') {
                return `It doesn't say anything.`
            }
        },
        check({desired, steps: {check: {code, object, tool}}}) {
            if (code === 'sc-ss') {
                return desired ? 'Checked.' : 'Unchecked.'
            }
            if (code === 'sc-dh') {
                return `You don't have the ${object.descriptors.name}.`
            }
            if (code === 'sc-nt') {
                return `I don't know how you do that with a ${tool.descriptors.name}.`
            }
            if (code === 'sc-ax') {
                return `It's already ${desired ? 'checked' : 'unchecked'}.`
            }
        },
    },
    general(action) {
        let {steps, fault} = action
        if (fault) {
            let {code, reason, object, container} = steps[fault]
            if (/inapparent/i.test(reason)) {
                throw new Error('unexpected inapparent')
                // let name = em.getComponent('Descriptors', id).getName()
                // return `You don't see any ${name} here.`
            }
            if (/inaccessible/i.test(reason)) {
                throw new Error('unexpected inaccessible')
                // let name = em.getComponent('Descriptors', container).getName()
                // return `The ${name} is closed.`
            }
            const subcode = code.substring(3, 5)
            if (subcode === 'iv') {
                let word = 'It'
                if (object) {
                    word = 'The ' + object.descriptors.name
                }
                return `${word} can't do that to itself!`
            }
            if (subcode === 'cc') {
                let containerWord = 'it\'s'
                if (container) {
                    containerWord = `the ${container.descriptors.name} is`
                }
                return `You can't do that while ${containerWord} closed.`
            }
            if (subcode === 'tb') {
                let objectWord = 'It\'s'
                if (object) {
                    objectWord = `The ${object.descriptors.name} is`
                }
                let containerWord = ''
                if (typeof container !== 'undefined') {
                    containerWord = ' in the ' + container.descriptors.name
                }
                return `${objectWord} too big to fit${containerWord}.`
            }
            if (subcode === 'th') {
                let objectWord = 'It\'s'
                if (object) {
                    objectWord = `The ${object.descriptors.name} is`
                }
                let containerWord = ''
                if (typeof container !== 'undefined') {
                    containerWord = ' for the ' + container.descriptors.name
                }
                return `${objectWord} too heavy${containerWord}.`
            }

            if (subcode === 'ft') {
                return `You can't move the ${object.descriptors.name}.`
            }

            if (subcode === 'pt') {
                return `The ${object.descriptors.name} is part of the ${object.location.parent.descriptors.name}.`
            }

            if (subcode === 'nc') {
                return `The ${object.descriptors.name} can't hold things.`
            }

            // If there's no response give a general response.
            const word = fault.replace(/^\w/, (c) => c.toUpperCase())
            return `${word}? Nope.`
        }
        // If there's no fault give a general response.
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
        if (output.code) {
            const handler = responses.errors[output.code]
            const response = handler(output)
            if (response) {
                return response
            }
        }

        // TODO: Unexpected error
        console.log(output)

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
