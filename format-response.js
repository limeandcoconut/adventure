
const {parser, lexer} = require('./parser')
const {interpreter} = require('./interpreter')
const {responses, missingParseParts} = require('./responses')
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
            const errorMeta = interpreter.errorMeta
            const handler = responses.errors.interpreter[errorMeta.type]
            if (handler) {
                const response = handler(errorMeta)
                if (response) {
                    return response
                }
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
