const Logger = require('./Logger');

const readline = require('readline');

const commandLoader = require('./commands/Loader');

module.exports = () => {
    process["internal"]["terminal"] = readline.createInterface(process.stdin, process.stdout);
    process["internal"]["terminal-input"] = true;
    process["internal"]["terminal"].on('close', () => {
        process["internal"]["terminal-input"] = false;
        Logger.info("[Terminal] Closed terminal input");
    });

    if (process["internal"]["terminal-input"]) {
        commandLoader.register()
            .then(() => Logger.info("[Terminal] Registering Commands..."))
            .catch(Logger.error);
        let commands = commandLoader.commands;
        process["internal"]["terminal"].setPrompt('');
        process["internal"]["terminal"].prompt();

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
        });
    }
}