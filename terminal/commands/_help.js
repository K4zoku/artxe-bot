const ConsoleCommand = require('./TerminalCommand');
const commandLoader = require('./Loader');
const Logger = require('../Logger');

module.exports = new ConsoleCommand(
    "help",
    [],
    "Display help message",
    "help",
    () => {
        for (const command of commandLoader.commands) {
            Logger.info(`| ${command.name}: ${command.desc}`);
            Logger.info(`|   Ex: ${command.example}`);
            Logger.info("--------------------------------");
        }
    }
)