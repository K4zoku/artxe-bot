const ConsoleCommand = require('./TerminalCommand');
const Logger = require('../Logger');

module.exports = new ConsoleCommand(
    "reload",
    [],
    "Reload command",
    "reload",
    () => {
        const terminal = require('./Loader');
        terminal.commands = []; // reset terminal commands
        terminal.register()
            .then(() => Logger.info("[Terminal] Registering Commands..."))
            .catch(Logger.error);
        const bot = require('../../commands/Loader');
        bot.commands = []; // reset bot commands
        bot.register()
            .then(() => Logger.info("[DiscordClient] Registering Commands..."))
            .catch(Logger.error);
    }
)