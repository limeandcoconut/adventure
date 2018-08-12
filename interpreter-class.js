class InterpreterError extends Error {
    constructor(message) {
        super(message)
        this.isInterpreterError = true
    }
}

class Interpreter {
    constructor() {
        this.handlers = new Map()
    }

    handler(type, handler) {
        if (typeof handler !== 'function') {
            throw new TypeError('Argument "handler" must be a Function.')
        }
        this.handlers.set(type, handler)
    }

    parseNode(node) {
        if (!node) {
            return
        }
        let handler = this.handlers.get(node.type)
        if (!handler) {
            throw new InterpreterError(`Unknown node type: ${node.type}.`)
        }
        return handler(node)
    }

    interpret(nodes) {
        if (!Array.isArray(nodes)) {
            throw new TypeError('Argument "nodes" must be an Array.')
        }
        return nodes.map((node) => {
            let action = this.parseNode(node)
            // console.log('*********** ACTION **********')
            // console.log(JSON.stringify(action, null, 4))
            return action
        })
    }

}

module.exports = {
    Interpreter,
    InterpreterError,
}
