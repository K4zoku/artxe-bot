const Command = require("../../command/command");
const cmdExit = new Command({
    label: "exit",
    aliases: ["quit", "q"],
    description: "Terminate the application",
    usage: "exit [exit_code]",
    execute: execute
});

const flags = {
    no_confirm: ["-y", "--no-confirm"]
}

function execute(args) {
    let exitCode = 0;
    if (args[0]) exitCode = +args[0];
    if (hasFlags(args, flags.no_confirm)) exit(exitCode);
    else confirm(exitCode);
    return true;
}

const equals = (a, b) => a === b; 
const equalsIgnoreCase = (a, b) => a.toUpperCase() === b.toUpperCase(); 

function hasFlags(args, flags, ignoreCases = true) {
    return args.some(arg => flags.some(flag => ignoreCases ? equalsIgnoreCase(flag, arg) : equals(flag, arg)))
}

function confirm(exitCode = 1, msg = "Do you really want to exit the application? [y/n]") {
    process.global.shell
        .asyncAsk(msg)
        .then(ans => {
            switch (ans.toLowerCase()) {
                case "y":
                case "yes":
                    exit(exitCode);
                    break;
                case "n":
                case "no":
                    break;
                default:
                    confirm(exitCode, "Only y (yes) or n (no)");
                    break;
            }
        });
}

function exit(exitCode = 1) {
    process.exit((exitCode | (255 - exitCode)) >= 0 ? exitCode : 1);
}

module.exports = cmdExit;