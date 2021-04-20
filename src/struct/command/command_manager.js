const CIM = require("case-insensitive-map");
const {readdir} = require("mz/fs");
const {join} = require('path');
const Command = require("./command");
const Writer = require("../writer");
const CommandFeedback = require("./command_feedback");

class CommandManager {
    #registered;
    #aliases;
    #writer;
    #feedback;
    constructor(opts = {
        writer: new Writer(s => Logger.info(s)),
        feedback: new CommandFeedback()
    }) {
        this.#registered = new CIM();
        this.#aliases = new CIM();
        this.#writer = opts.writer;
        this.#feedback = opts.feedback;
    }

    /**
     *
     * @param command {Command}
     */
    register(command) {
        command.setCommandManager(this);
        const label = command.label;
        this.#registered.set(label, command);
        this.#aliases.set(label, label);
        command.aliases.forEach(alias => this.#aliases.set(alias, label));
        // TODO: fix duplicate command label or alias
    }

    loadCommands(directory) {
        return readdir(directory)
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
        if (this.hasCommand(label)) {
            const command = this.getCommand(label);
            return validate(command, data) ?
                command.execute(args, data)
                    .catch(e => {
                        error(e);
                        this.#writer.write("An error occurred");
                    }) :
                false;
        } else {
            this.#feedback && this.#writer.write(placeholder(this.#feedback.commandNotFound, "label", label));
            return false;
        }
    }

    getWriter() {
        return this.#writer;
    }

    getRegistered() {
        return Array.from(this.#registered.values());
    }

    getAlias(label) {
        return this.#aliases.get(label);
    }

    hasCommand(labelOrAlias) {
        return this.#aliases.has(labelOrAlias);
    }

    getCommand(labelOrAlias) {
        return this.#registered.get(this.#aliases.get(labelOrAlias));
    }
}

module.exports = CommandManager;