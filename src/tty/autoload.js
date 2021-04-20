const {join} = require("path");
const loggerOpts = {
    label: "TTY"
}
module.exports = async () => {
    if (!(process.stdin.isTTY && process.stdout.isTTY)) return global.shell = false;
    Logger.info("Detected TTY, initializing shell...", loggerOpts);
    Logger.info("Loading TTY commands...", loggerOpts);
    const ttyCM = new CommandManager();
    ttyCM.loadCommands(join(__src, "tty/commands")).catch(error);
    Logger.info("Type 'help' or '?' to show all available commands", loggerOpts);
    const shell = new Shell(ttyCM);
    Logger.on("data", () => shell.prompt());
    global.shell = shell;
    return shell.listen();
}
