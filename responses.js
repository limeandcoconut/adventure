let {entityManager} = require('./managers.js')

let responses = {
    responses: {
        errors: {
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
            inventory({inventory}) {
                if (!inventory.length) {
                    return `You don't have antying.`
                }
                /* eslint-disable require-jsdoc */
                function describeInventory(inventory, level = 0) {
                    let tab = '    '
                    let indent = tab.repeat(level)
                    let output
                    if (level) {
                        output = `${indent}It contains:\n`
                    } else {
                        output = `You are carrying:\n`
                    }

                    inventory.forEach(({
                        id,
                        inventory,
                    }) => {
                        let name = entityManager.getComponent('ObjectDescriptorComponent', id).getName()
                        output += `${tab}${indent}${name}\n`
                        if (inventory) {
                            output += describeInventory(inventory, level + 1)
                        }
                    })

                    return output
                }

                return describeInventory(inventory)
            },
            open() {
                return 'Opened.'
            },
        },
        failure: {
            get({reason, container, id}) {
                if (/have/i.test(reason)) {
                    return 'You already have that.'
                }
                if (/inaccessible/i.test(reason)) {
                    let name = entityManager.getComponent('ObjectDescriptorComponent', container).getName()
                    return `The ${name} is closed.`
                }
            },
            drop({reason, container}) {
                if (/don.?t/i.test(reason)) {
                    return `You don't have that`
                }
                if (/inaccessible/i.test(reason)) {
                    let name = entityManager.getComponent('ObjectDescriptorComponent', container).getName()
                    return `The ${name} is closed.`
                }
            },
            resolve({reason, object, objects}) {
                console.log(object)
                if (/cannot/i.test(reason)) {
                    return `I don't see any ${object}.`
                }
                console.log(objects)
                if (/multiple/i.test(reason)) {
                    let names = objects.map((object) => entityManager.getComponent('ObjectDescriptorComponent', object).getName())
                    let last = names.pop()
                    names = names.join(', ')
                    names += ', or the ' + last
                    return `Do you mean the ${names}?`
                }
            },
            preresolve() {
                return 'I don\'t see anything.'
            },
            open({reason}) {
                if (/already/i.test(reason)) {
                    return 'It\'s already open.'
                }
                if (/not.*container/i.test(reason)) {
                    let name = entityManager.getComponent('ObjectDescriptorComponent', container).getName()
                    return `How do you open a ${name}?`
                }
            },
        },
        general({reason, id}) {
            if (/inapparent/i.test(reason)) {
                let name = entityManager.getComponent('ObjectDescriptorComponent', id).getName()
                return `You don't see any ${name} here.`
            }
            return 'Done.'
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
