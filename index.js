process.stats = {
    startTime: new Date(),
    errorCount: 0,
    warningCount: 0,
};

require('dotenv').config();
const minimist = require('minimist');
const Logger = require('./terminal/Logger');
const terminal = require('./terminal');
const {fallback, login} = require('./handler/utils');

const Discord = require('discord.js');
process["internal"] = {};
process["internal"]["opts"] = minimist(process.argv, {
    alias: {
        t: "token",
        p: "prefix",
        h: "help",
        d: "debug"
    }
});
process["internal"]["settings"] = {};
process["internal"]["settings"]["debug"] = fallback(process["internal"]["opts"]["debug"], false);
if (process["internal"]["settings"]["debug"]) Logger.debug("Debug enabled!");

process["internal"]["discord"] = {};
process["internal"]["discord"]["bot"] = {};
process["internal"]["discord"]["bot"]["token"] = fallback(process["internal"]["opts"]["token"], process.env.BOT_TOKEN, "");

process["internal"]["discord"]["client"] = new Discord.Client();

const events = require('./events/Loader');
events.register(process["internal"]["discord"]["client"])
    .then(() => Logger.info("[DiscordClient] Registering events..."))
    .catch(Logger.error);

const commands = require('./commands/Loader');
commands.register()
    .then(() => Logger.info("[DiscordClient] Registering Commands..."))
    .catch(Logger.error);

process["internal"]["discord"]["bot"]["logged-in"] = false;
if (process["internal"]["discord"]["bot"]["token"] !== "") {
    login();
} else {
    Logger.warning("No token was found, please input it by type 'login {BotToken}'");
}

terminal(process["internal"]["discord"]["client"]);