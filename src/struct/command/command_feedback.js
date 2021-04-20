
class CommandFeedback {
    constructor(opts={
        commandNotFound: "Command '{label}' not found",
    }) {
        this.commandNotFound = opts.commandNotFound;
    }
}

module.exports = CommandFeedback;