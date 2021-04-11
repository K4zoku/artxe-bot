const {join} = require("path");
const {src, logger} = process.global;
const CommandManager = require(join(src, "core/command/command_manager"));

module.exports = async () => {
    if (!(process.stdin.isTTY && process.stdout.isTTY)) return;
    logger.info("Detected TTY, initializing shell...");
    const Shell = require(join(src, "core/tty/shell"));
    logger.info("Loading TTY commands...");
    const ttyCM = new CommandManager();
    ttyCM.loadCommands(join(src, "core/tty/commands"));
    logger.info("Type 'help' or '?' to show all available commands");
    const shell = new Shell(ttyCM);
    logger.on("data", () => shell.prompt());
    process.global.shell = shell;
    return shell.listen();
}
