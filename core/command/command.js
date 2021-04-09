class Command {
    constructor(optsOrLabel, aliases=[], description="", usage="", execute=()=>{})  {
        this.label = optsOrLabel instanceof Object ? optsOrLabel.label : optsOrLabel;
        this.aliases = optsOrLabel instanceof Object ? optsOrLabel.aliases : aliases;
        this.description = optsOrLabel instanceof Object ? optsOrLabel.description : description;
        this.usage = optsOrLabel instanceof Object ? optsOrLabel.usage : usage;
        this.execute = optsOrLabel instanceof Object ? optsOrLabel.execute : execute;
    }

    /**
     *
     * @param commandManager {CommandManager}
     */
    setCommandManager(commandManager) {
        this.commandManager = commandManager;
    }

    getCommandManager() {
        return this.commandManager;
    }
}

module.exports = Command;