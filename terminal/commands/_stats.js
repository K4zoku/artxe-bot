const ConsoleCommand = require('./TerminalCommand');
const Logger = require('../Logger');
const date = require('date-and-time');

module.exports = new ConsoleCommand(
    "stats",
    ["stat", "status"],
    "View status",
    "stat",
    () => {
        Logger.info(`ERROR: ${process.stats.errorCount}`);
        Logger.info(`WARN: ${process.stats.warningCount}`);
    }
)