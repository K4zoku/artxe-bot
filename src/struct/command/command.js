class Command {
    constructor(optsOrLabel, aliases=[], description="", usage="", execute=()=>{}, data)  {
        this.label = optsOrLabel.label ?? optsOrLabel;
        this.aliases = optsOrLabel.aliases ?? aliases;
        this.description = optsOrLabel.description ?? description;
        this.usage = optsOrLabel.usage ?? usage;
        this.execute = optsOrLabel.execute ?? execute;
        this.data = optsOrLabel.data ?? data;
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