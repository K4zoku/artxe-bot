const {join} = require("path");

module.exports = async () => {
    if (!(process.stdin.isTTY && process.stdout.isTTY)) return global.shell = false;
    Logger.info("Detected TTY, initializing shell...");
    Logger.info("Loading TTY commands...");
    const ttyCM = new CommandManager();
    ttyCM.loadCommands(join(__src, "tty/commands")).catch(error);
    Logger.info("Type 'help' or '?' to show all available commands");
    const shell = new Shell(ttyCM);
    Logger.on("data", () => shell.prompt());
    global.shell = shell;
    return shell.listen();
}
