const Logger = require('./Logger');

const readline = require('readline');

const commandLoader = require('./commands/Loader');

module.exports = () => {
    process["internal"]["terminal"] = readline.createInterface(process.stdin, process.stdout);
    commandLoader.register()
        .then(() => Logger.info("[Terminal] Registering Commands..."))
        .catch(Logger.error);
    let commands = commandLoader.commands;
    process["internal"]["terminal"].setPrompt('');
    process["internal"]["terminal"].prompt();
    process["terminal"]["closed"] = false;

    process["internal"]["terminal"].on('line', (line) => {
        process.stdout.write("\rαΓτΧε> ");
        process["internal"]["terminal"].prompt();
        line = line.trim();
        let commandArgs = line.split(" ");
        let commandLabel = commandArgs.shift();
        for (const command of commands) {
            if (commandLabel.match(command.alias.concat([command.name]).join("|"))) {
                command.execute(commandArgs);
                return;
            }
        }
        Logger.info("mhmm, seems like the cat is walking on keyboard ¯\\_(ツ)_/¯");
    }).on('close', () => {
        process["terminal"]["closed"] = true;
        Logger.info("[Terminal] Closed terminal input");
    });
}