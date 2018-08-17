class InterpreterError extends Error {
    constructor(message) {
        super(message)
        this.isInterpretError = true
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
            throw new Error(`Unknown node type: ${node.type}.`)
        }
        return handler(node)
    }

    interpret(nodes) {
        if (!Array.isArray(nodes)) {
            throw new TypeError('Argument "nodes" must be an Array.')
        }
        return nodes.map(this.parseNode.bind(this))
    }

}

module.exports = {
    Interpreter,
    InterpreterError,
}
