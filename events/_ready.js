const Logger = require('../terminal/Logger');
const EventInterface = require('./Event');

module.exports = new EventInterface("once", "ready", () => {
        Logger.info("[DiscordClient] Ready!");
        process["internal"]["discord"]["bot"]["prefixes"] = require('../configurations/bot-settings.json').prefixes.concat([`<@!${process["internal"]["discord"]["client"].user.id}>`]);
    });
