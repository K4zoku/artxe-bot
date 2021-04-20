const help = new Command({
    label: "help",
    aliases: ["?"],
    description: "Print help",
    usage: "help [command]",
    execute: execute
});

function execute(args) {
    const cm = help.getCommandManager();
    switch (args.length) {
        case 0:
            cm.write(
                [
                    "",
                    "All available commands: ",
                    cm.getRegistered()
                        .map(cmd => `  ${cmd.label} - ${cmd.description}`)
                ]
                .flat()
                .join("\n"),
                {label: "TTY"}
            );
            return true;
        case 1:
            if (!cm.hasCommand(args[0])) {
                cm.write(`No help available for '${args[0]}'`);
                return false;
            }
            const command = cm.getCommand(args[0]);
            cm.write(
                [
                    "",
                    command.label,
                    `Aliases: [${command.aliases.join(", ") ?? " "}]`,
                    `Description: ${command.description}`,
                    `Usage: ${command.usage}`
                ]
                .join("\n"),
                {label: "TTY"}
            );
            return true;
        default:
            cm.write(`Usage: ${help.usage}`, {label: "TTY"});
            return false;
    }
}

module.exports = help;