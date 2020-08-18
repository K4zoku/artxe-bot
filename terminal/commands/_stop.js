const ConsoleCommand = require('./TerminalCommand');
const Logger = require('../Logger');

module.exports = new ConsoleCommand(
    "stop",
    ["shutdown"],
    "Safe shutdown bot",
    "stop",
    () => {
        Logger.info("Shutting down...");
        process["discordClient"].destroy();
        process["terminal"].close();
    }
)