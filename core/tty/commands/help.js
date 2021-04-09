const Command = require("../../command/command");

const help = new Command({
    label: "help",
    aliases: ["?"],
    description: "Print help",
    usage: "help [command]",
    execute: execute
});

function execute(args) {
    const cm = help.getCommandManager();
    const {write} = cm.getWriter();
    const registered = cm.getRegistered();
    switch (args.length) {
        case 0:
            write("All available commands: ");
            Array.from(registered.values())
                .map(command => `${command.usage} - ${command.description}`)
                .forEach(write);
            return true;
        case 1:
            if (registered.has(args[0])) {
                let command = registered.get(args[0]);
                write(`${command.label}\nAliases: [${command.aliases.join(", ")}]\nDescription: ${command.description}\nUsage: ${command.usage}`);
                return true;
            }
            write(`No help available for '${args[0]}'`);
            return false;
        default:
            return false;
    }
}

module.exports = help;