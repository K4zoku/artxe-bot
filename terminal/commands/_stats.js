const ConsoleCommand = require('./TerminalCommand');
const Logger = require('../Logger');

module.exports = new ConsoleCommand(
    "stats",
    ["stat", "status"],
    "View status",
    "stat",
    () => {
        Logger.info(`ERROR: ${process["stats"]["errorCount"]}`);
        Logger.info(`WARN: ${process["stats"]["warningCount"]}`);
    }
)