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
    switch (args.length) {
        case 0:
            write(
                [
                    "",
                    "All available commands: ",
                    cm.getRegistered()
                        .map(cmd => `  ${cmd.label} - ${cmd.description}`)
                ]
                .flat()
                .join("\n")
            );
            return true;
        case 1:
            if (!cm.hasCommand(args[0])) {
                write(`No help available for '${args[0]}'`);
                return false;
            }
            const command = cm.getCommand(args[0]);
            write(
                [
                    "",
                    command.label,
                    `Aliases: [${command.aliases.join(", ") ?? " "}]`,
                    `Description: ${command.description}`,
                    `Usage: ${command.usage}`
                ]
                .join("\n")
            );
            return true;
        default:
            write(`Usage: ${help.usage}`);
            return false;
    }
}

module.exports = help;