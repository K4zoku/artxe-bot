const {join} = require("path");
const src = process.global.src;
const logger = process.global.logger;
const CommandManager = require(join(src, "core/command/command_manager"));

if (process.stdin.isTTY && process.stdout.isTTY) {
    logger.info("Detected TTY, initializing shell...");
    const Shell = require(join(src, "core/tty/shell"));
    logger.info("Loading TTY commands...");
    const ttyCM = new CommandManager();
    ttyCM.loadCommands(join(src, "core/tty/commands"));
    logger.info("Type 'help' or '?' to show all available commands");
    const shell = new Shell(ttyCM);
    logger.on('data', log => shell.prompt());
    shell.listen().catch(err => logger.error(err));
    process.global.shell = shell;
}