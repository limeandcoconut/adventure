
/*
evaluator
*/
/* eslint-disable require-jsdoc */
function evaluate(parseTree) {

    let verbs = {
        pick: {
            basal: (node) => node,
            variations: [

            ],
        },
    }

    let args = {}

    let context = {}

    function parseNode(node) {
        if (!node) {
            return
        }
        if (node.type === 'number') {
            return node.value
            // } else if (operators[node.type]) {
            //     if (node.left && node.right) {
            //         return operators[node.type](parseNode(node.left), parseNode(node.right))
            //     } else if (node.left) {
            //         return operators[node.type](parseNode(node.left))
            //     }
            //     return operators[node.type](parseNode(node.right))
        } else if (node.type === 'preposition-adverb-postfix') {
            context.verb = context.verb || ''
            context.verb += ' ' + node.word
            parseNode(node.object)
        } else if (node.type === 'adverb') {
            context.adverb = context.adverb || ''
            context.adverb += ' ' + node.word
            parseNode(node.object)
        } else if (node.type === 'verb') {
            context.verb = context.verb || ''
            context.verb = node.word + ' ' + context.verb
            parseNode(node.object)
        } else if (node.type === 'adjective') {
            context.adjective = context.adjective || ''
            context.adjective = node.word + ' ' + context.adjective
            parseNode(context.adjecti)
            // } else if (node.type === 'function') {
            //     // Must not an be arrow function so that 'arguments' is generated.
            //     functions[node.name] = function() {
            //         for (var i = 0; i < node.args.length; i++) {
            //             args[node.args[i].value] = arguments[i]
            //         }
            //         var ret = parseNode(node.value)
            //         args = {}
            //         return ret
            //     }
        }
        console.log(context)
        // return context
    }

    let output = ''
    for (let i = 0; i < parseTree.length; i++) {
        let value = parseNode(parseTree[i])
        if (typeof value !== 'undefined') {
            output += value + '\n'
        }
    }
    return output
}
