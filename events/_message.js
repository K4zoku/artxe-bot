const Logger = require('../terminal/Logger');
const EventInterface = require('./Event');

const imis = require("../handler/imis");

const {ownerId} = require("../configurations/bot-settings.json");
const commandLoader = require('../commands/Loader');

module.exports = new EventInterface("on", "message", async (...args) => {
    const message = args[0][0];
    const msg = message.content;
    const member = message.member;
    const channel = message.channel;

    let matchPrefix = false;
    let prefix = ""
    let prefixes = process["internal"]["discord"]["bot"]["prefixes"];
    for (const p of prefixes) {
        if (msg.startsWith(p)) {
            matchPrefix = true;
            prefix = p;
            break;
        }
    }

    if (matchPrefix) {
        let commandText = msg.replace(prefix, "").trimStart();
        let commandArgs = commandText.split(" ");
        let commandLabel = commandArgs.shift();
        let commands = commandLoader.commands;
        for (const command of commands) {
            if (command.alias.concat([command.name]).includes(commandLabel)) {
                Logger.info(`[BotCommands] User ${message.author.tag} issued bot command: ${commandText}`);
                if (command.owner && member.id !== ownerId) {
                    Logger.info("[BotCommands] Only owner can use this command");
                    return;
                }
                if (!command.bot && message.author.bot) {
                    Logger.info("[BotCommands] Bot can't use this command");
                    return;
                }
                if (!member.permissions.has(command.permissions)) {
                    Logger.info("[BotCommands] This user not enough permission!");
                    return;
                }
                if (!command.dm && channel.type === "dm") {
                    Logger.info("[BotCommands] This command can't use in Direct Message");
                    return;
                }
                if (command.nsfw && !channel.nsfw) {
                    Logger.info("[BotCommands] This command require nsfw channel!");
                    return;
                }
                await command.execute(commandLabel, commandArgs, message, member, channel);
                Logger.info("[BotCommands] Command executed!");
                return;
            }
        }
    } else if (channel.type === "dm" && !message.author.bot) {
        Logger.debug(channel.id);
        imis.reply(message);
    }
});