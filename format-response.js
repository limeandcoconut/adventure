
const {parser, lexer} = require('./parser.js')
const {responses, missingParseParts} = require('./responses.js')
/* eslint-disable require-jsdoc, complexity */
function formatResponse(output) {
    // Errors:
    if (output instanceof Error) {
        if (output.isLexError) {
            let word = lexer.errorMeta.word
            let char = lexer.errorMeta.char
            if (word) {
                return responses.errors.unknownWord(word)
            } else if (char) {
                return responses.errors.unknownChar(char)
            }
        } else if (output.isParseError) {
            let binder = parser.errorMeta.binder
            let token = parser.errorMeta.token
            let missing = missingParseParts[binder ? binder.type : token.type]
            if (missing) {
                return responses.errors.missingPart(missing)
            }
            if (token.type !== parser.endToken) {
                return responses.errors.understandWord(token.word)
            }
            return responses.errors.understandSentence()
            // } else if (output.isResolutionError) {
            //     return responses.errors.understandSentence()
        } else if (output.isInterpreterError) {
            if (/multiple/i.test(output.message)) {
                let context
                if (/adjective/i.test(output.message)) {
                    context = 'adjective'
                } else if (/indirect/i.test(output.message)) {
                    context = 'indirect'
                }
                return responses.errors.multipleNoun(context)
            } else if (/pronoun/i.test(output.message)) {
                let context
                if (/adjective/i.test(output.message)) {
                    context = 'adjective'
                }
                return responses.errors.pronoun(context)
            }
            return responses.errors.understandSentence()
        }
        return responses.errors.fatal(output)
    }

    // If there was no recognized input.
    if ((typeof output === 'string' || Array.isArray(output)) && !output.length) {
        return responses.noInput()
    }

    // If the action succeeded.
    if (output.live) {
        const handler = responses.success[output.reporter]
        if (handler) {
            const response = handler(output.steps)
            if (response) {
                return response
            }
        }
        return responses.general(output)
        // If the action failed.
    } else if (output.live === false) {
        const fault = output.fault
        const handler = responses.failure[fault]
        console.log(JSON.stringify(output.steps, null, 4))
        if (handler) {
            const response = handler(output.steps, fault)
            if (response) {
                return response
            }
        }
        return responses.general(output)
    }
}

module.exports = formatResponse
