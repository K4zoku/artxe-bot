const path = require('path');
const fs = require('fs');
const Logger = require('../terminal/Logger');

module.exports.register = async (client) => {
    await fs.readdir(__dirname, async (err, files) => {
        if (err) Logger.error(err);

        let jsFiles = files.filter(file => file.split(".").pop() === "js");
        if (jsFiles.length === 0) return Logger.warning("[EventsLoader] Couldn't find any event!");
        await Promise.all(jsFiles.map(async (file) => {
            const event = require(path.join(__dirname, file));
            if (!file.startsWith("_") || event.name === undefined || event.name === "") return;
            Logger.debug(`[ClientEventsLoader] Registering event ${event.name}`);
            switch (event.type) {
                case "once":
                    await client.once(event.name, (args) => {
                        event.execute(args);
                    });
                    break;
                case "on":
                default:
                    await client.on(event.name, (...args) => {
                        event.execute(args);
                    });
                    break;
            }
        }));
    });
}