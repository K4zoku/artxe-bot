const CIM = require("case-insensitive-map");
const fsp = require("fs").promises;
const {join} = require('path');
const Command = require("./command");
const Writer = require("../writer");
const CommandFeedback = require("./command_feedback");
const {apply} = require("../placeholder");

class CommandManager {
    constructor(opts = {
        writer: new Writer(s => process.global.logger.info(s)),
        feedback: new CommandFeedback()
    }) {
        this.registered = new CIM();
        this.aliases = new CIM();
        this.writer = opts.writer;
        this.feedback = opts.feedback;
    }

    /**
     *
     * @param command {Command}
     */
    register(command) {
        command.setCommandManager(this);
        const label = command.label;
        this.registered.set(label, command);
        this.aliases.set(label, label);
        command.aliases.forEach(alias => this.aliases.set(alias, label));
        // TODO: fix duplicate command label or alias
    }

    loadCommands(directory) {
        fsp.readdir(directory)
            .then(files =>
                files.filter(file => file.toLowerCase().endsWith(".js"))
                    .map(file => join(directory, file))
                    .map(require)
                    .filter(object => object instanceof Command) // Command[]
                    .forEach(command => this.register(command))
            );
    }

    execute(rawCommand, data, validate=()=>true) {
        let args = rawCommand.split(" ");
        let label = args.length > 0 ? args.shift() : rawCommand;
        if (this.aliases.has(label)) {
            let command = this.getRegistered().get(this.getAlias(label));
            return validate(command, data) ? command.execute(args, data) : false;
        } else {
            this.getWriter().write(apply(this.feedback.commandNotFound, "label", label));
            return false;
        }
    }

    getWriter() {
        return this.writer;
    }

    getRegistered() {
        return this.registered;
    }

    getAlias(label) {
        return this.aliases.get(label);
    }
}

module.exports = CommandManager;