const Logger = require('../terminal/Logger');
const EventInterface = require('./Event');

module.exports = new EventInterface("once", "ready", () => {
        Logger.info("[DiscordClient] Ready!");
        process['botPrefixes'] = require('../configurations/bot-settings.json').prefixes.concat([`<@!${process['discordClient'].user.id}>`]);
    });
