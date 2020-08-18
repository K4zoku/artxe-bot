const path = require('path');
const fs = require('fs');
const Logger = require('../Logger');

module.exports.commands = [];
module.exports.register = async () => {
    await fs.readdir(__dirname, async (err, files) => {
        if (err) Logger.error(err);

        let jsFiles = files.filter(file => file.split(".").pop() === "js");
        if (jsFiles.length === 0) return Logger.warning("[TerminalCommands] Couldn't find any command!");
        await Promise.all(jsFiles.map(async (file) => {
            const command = require(path.join(__dirname, file));
            if (!file.startsWith("_") || command.name === undefined || command.name === "") return;
            Logger.debug("[TerminalCommandsLoader] Registering command " + command.name);
            this.commands.push(command);
        }));
    });
}