const Command = require("../../command/command");

const exit = new Command({
    label: "exit",
    aliases: ["quit"],
    description: "Terminate the application",
    usage: "exit [exit_code]",
    execute: execute
});

function execute(args) {
    let exit_code = 0;
    if (args[0]) exit_code = +args[0];
    process.global.shell.ask("Do you really want to exit the application? [y/n]", ans => {
        if (ans.toLowerCase() === "y") process.exit((exit_code | (255 - exit_code)) >= 0 ? exit_code : 1);
    })
    return true;
}

module.exports = exit;