const ConsoleCommand = require('./TerminalCommand');
const Logger = require('../Logger');

module.exports = new ConsoleCommand(
    "stop",
    ["shutdown"],
    "Safe shutdown bot",
    "stop",
    () => {
        Logger.info("Shutting down...");
        process["internal"]["discord"]["client"].destroy();
        process["internal"]["terminal"].close();
        process.exit(0);
    }
)