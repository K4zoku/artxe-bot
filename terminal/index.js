const Logger = require('./Logger');

const readline = require('readline');
process["terminal"] = readline.createInterface(process.stdin, process.stdout);

const commandLoader = require('./commands/Loader');

module.exports = () => {
    commandLoader.register()
        .then(() => Logger.info("[Terminal] Registering Commands..."))
        .catch(Logger.error);
    let commands = commandLoader.commands;
    process["terminal"].setPrompt('');
    process["terminal"].prompt();

    process["terminal"].on('line', (line) => {
        process.stdout.write("\rαΓτΧε> ");
        process["terminal"].prompt();
        line = line.trim();
        let commandArgs = line.split(" ");
        let commandLabel = commandArgs.shift();
        for (const command of commands) {
            if (commandLabel.match(command.alias.concat([command.name]).join("|"))) {
                command.execute();
                return;
            }
        }
        Logger.info("mhmm, seems like the cat is walking on keyboard ¯\\_(ツ)_/¯");
    }).on('close', () => {
        process.exit(0);
    });
}