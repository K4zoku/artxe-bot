process.stats = {
    startTime: new Date(),
    errorCount: 0,
    warningCount: 0,
};

require('dotenv').config();
const minimist = require('minimist');
const Logger = require('./terminal/Logger');
const terminal = require('./terminal');

const Discord = require('discord.js');


process["launchOptions"] = minimist(process.argv, {
    alias: {
        t: "token",
        p: "prefix",
        h: "help",
        d: "debug"
    }
});

process["debugEnabled"] = process["launchOptions"]["debug"] !== undefined && process["launchOptions"]["debug"];
if (process["debugEnabled"]) Logger.debug("Debug enabled!");
process.env.BOT_TOKEN = process["launchOptions"]["token"] !== undefined ? process["launchOptions"]["token"] : process.env.BOT_TOKEN === undefined ? "" : process.env.BOT_TOKEN;

process["discordClient"] = new Discord.Client();

const events = require('./events/Loader');
events.register(process["discordClient"])
    .then(() => Logger.info("[DiscordClient] Registering events..."))
    .catch(Logger.error);

const commands = require('./commands/Loader');
commands.register()
    .then(() => Logger.info("[DiscordClient] Registering Commands..."))
    .catch(Logger.error);

process["discordClient"].login(process.env.BOT_TOKEN)
    .then(() => Logger.info(`[DiscordClient] Logged in as ${process["discordClient"].user.tag}`))
    .catch(Logger.error);

terminal(process["discordClient"]);