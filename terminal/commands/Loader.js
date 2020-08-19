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

module.exports.unload = (name="") => {
    for (const command of this.commands) {
        if (command.name === name) {
            this.commands.remove(name);
            Logger.info("[TerminalCommandsLoader] Unloaded command " + name);
        }
    }
}

Array.prototype.remove = (searchElement, deleteCount=1) => {
    if (this.includes(searchElement)) this.splice(this.indexOf(searchElement), deleteCount);
}