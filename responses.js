let {entityManager: em} = require('./managers.js')

/* eslint-disable require-jsdoc */
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

let responses = {
    responses: {
        errors: {
            multipleNoun(context) {
                if (context === 'adjective') {
                    return 'You can\'t use adjectives with multiple nouns.'
                }
                if (context === 'indirect') {
                    return 'You can\'t use multiple nouns as indirect objects like that.'
                }
                return 'You can\'t use multiple nouns in that way.'
            },
            pronoun(context) {
                if (context === 'adjective') {
                    return 'You can\'t use adjectives with pronouns like that.'
                }
                return 'You can\'t use a pronoun in that way.'
            },
            unknownWord(word) {
                return `I'm sorry, I don't know the word "${word}".`
            },
            unknownChar(char) {
                return `I'm sorry, I don't know what "${char}" means.`
            },
            missingPart(missing) {
                return `There seems to be an ${missing} missing from that sentence.`
            },
            understandWord(word) {
                return `I don't understand how you used the word "${word}".`
            },
            understandSentence() {
                return `That sentence isn't one I recognize`
            },
            fatal() {
                return `Well it looks like this one is on me. ` +
                    `Something terrible just happened and it doesn't look like we can fix it.`
            },
        },
        success: {
            get() {
                return 'Taken.'
            },
            drop() {
                return 'Dropped.'
            },
            inventory({inventory: {inventory}}) {
                if (!inventory.length) {
                    return `You don't have anything.`
                }

                let output = `You are carrying:\n`
                output += describeContents({contents: inventory})
                return output
            },
            open() {
                return 'Opened.'
            },
            close() {
                return 'Closed.'
            },
            move(steps) {
                // TODO: better reporting
                // console.log(area)
                if (steps.look) {
                    return responses.responses.success.look(steps)
                }
                return `- ${steps.move.area.getTitle()} -\n`
            },
            begin(steps) {
                return '\n \nYou\'re in a room, utterly boring with just a hint of institutionalized over optimism. ' +
                    'It\'s a small kindness not to describe the nearly blank nearly white walls and other environs in any detail. ' +
                    'A cloying sense of insincerity pervades this place. Florescent lights hum overhead... \n' +
                    'You notice a sign on the wall that has been laminated so that the paper is ever so slightly askew within the plastic coating - ' +
                    'it would seem that such things are never perfect. It reads:' +
                    '\n \n######################################\n \n' +
                    'WELCOME TO THE TESTING AREA:\n' +
                    'Congratulations on your new position!\n' +
                    'This environment promotes fun and cooperation.\n \n' +
                    '######################################\n \n' +
                    'You can feel the ennui setting in already.\n \n' +
                    responses.responses.success.look(steps)
            },
            look({look: {object, area, contents}}) {
                let output = ''
                const context = {contents}
                if (area) {
                    output += `\n- ${area.getTitle()} -\n `
                    context.opening = 'There is a '
                    context.closing = ' here.'
                }
                output += `\n${em.getComponent('Appearance', object).getAppearance()}\n`

                if (contents && contents.length) {
                    if (!area) {
                        output += `It contains:\n`
                    }
                    output += describeContents(context)
                }
                return output
            },
            put({put, get}) {
                let output = ''
                if (get) {
                    output += responses.responses.success.get(get)
                    output += ' \n'
                }
                return output + 'Done.'
            },
        },
        failure: {
            get({get: {reason, container}}) {
                if (/have/i.test(reason)) {
                    return 'You already have that.'
                }
                if (/inaccessible/i.test(reason)) {
                    let name = em.getComponent('Descriptors', container).getName()
                    return `The ${name} is closed.`
                }
            },
            drop({drop: {reason, container}}) {
                if (/don.?t/i.test(reason)) {
                    return `You don't have that`
                }
                if (/inaccessible/i.test(reason)) {
                    let name = em.getComponent('Descriptors', container).getName()
                    return `The ${name} is closed.`
                }
            },
            resolve({resolve: {reason, object, objects}}) {
                console.log(object)
                if (/cannot/i.test(reason)) {
                    return `I don't see any ${object}.`
                }
                console.log(objects)
                if (/multiple/i.test(reason)) {
                    let names = objects.map((object) => em.getComponent('Descriptors', object).getName())
                    let last = names.pop()
                    names = names.join(', ')
                    names += ', or the ' + last
                    return `Do you mean the ${names}?`
                }
            },
            preresolve({preresolve: {reason}}) {
                // return 'I don\'t see anything.'
                return reason
            },
            open({open: {reason, id}}) {
                if (/already/i.test(reason)) {
                    return 'It\'s already open.'
                }
                if (/not.*container/i.test(reason)) {
                    let name = em.getComponent('Descriptors', id).getName()
                    return `How do you open a ${name}?`
                }
            },
            close({close: {reason, id}}) {
                if (/already/i.test(reason)) {
                    return 'It\'s already closed.'
                }
                if (/not.*container/i.test(reason)) {
                    let name = em.getComponent('Descriptors', id).getName()
                    return `How do you close a ${name}?`
                }
            },
            move({move: {reason, direction}}) {
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
                console.log(reason)
                if (/no.*door/i.test(reason)) {
                    return `There's no way to go ${directions[direction]}.`
                }
            },
            put({put: {reason, object}}) {
                if (/inceptive/i.test(reason)) {
                    let name = em.getComponent('Descriptors', object).getName()
                    return `You can't put a ${name} inside itself!`
                }
                if (/big/i.test(reason)) {
                    return 'That\'s too big to fit.'
                }
                if (/heavy/i.test(reason)) {
                    return 'That\'s too heavy to fit.'
                }
                return reason
            },
        },
        general({steps, fault, type, object}) {
            if (fault) {
                let {reason, id} = steps[fault]
                if (/inapparent/i.test(reason)) {
                    let name = em.getComponent('Descriptors', id).getName()
                    return `You don't see any ${name} here.`
                }

                if (/inceptive/i.test(reason)) {
                    let word = 'It'
                    if (typeof object !== 'undefined') {
                        word = 'The ' + em.getComponent('Descriptors', object).getName()
                    }
                    return `The ${word} can't do that to itself!`
                }

                if (/big/i.test(reason)) {
                    return 'That\'s too big to fit.'
                }
                if (/heavy/i.test(reason)) {
                    return 'That\'s too heavy to fit.'
                }

                const word = fault.replace(/^\w/, c => c.toUpperCase())
                return `${word} Nope.`
            }
            return `${type} Done.`
        },
        noInput() {
            return 'Beg your pardon?'
        },
    },
    missingParseParts: {
        'conjunction': 'noun',
        'verb': 'noun',
        'adverb': 'verb',
        'preposition-adverb-postfix': 'verb',
        'preposition-phrase-infix': 'noun',
    },
}

module.exports = responses
