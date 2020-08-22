const Logger = require('../terminal/Logger');
const EventInterface = require('./Event');

const imis = require("../handler/imis");

const {ownerId} = require("../configurations/bot-settings.json");
const commandLoader = require('../commands/Loader');
const {fallback} = require("../handler/utils");

module.exports = new EventInterface("on", "message", async (...args) => {
    const message = args[0][0];
    const msg = message.content;
    const member = fallback(message.member, message.author);
    const channel = message.channel;
    let matchPrefix = false;
    let prefixLength = 0;
    let prefixes = process["internal"]["discord"]["bot"]["prefixes"];
    for (const prefix of prefixes) {
        if (msg.toLowerCase().startsWith(prefix.toLowerCase())) {
            matchPrefix = true;
            prefixLength = prefix.length;
            break;
        }
    }

    if (matchPrefix) {
        let commandText = msg.substr(prefixLength, msg.length).trim();
        let commandArgs = commandText.split(" ");
        let commandLabel = commandArgs.shift();
        let commands = commandLoader.commands;
        for (const command of commands) {
            if (command.alias.concat([command.name]).includes(commandLabel)) {
                Logger.info(`[BotCommands] User ${message.author.tag} issued bot command: ${commandText}`);
                if (command.owner && member.id !== ownerId) {
                    Logger.info("[BotCommands] Only owner can use this command");
                    break;
                }
                if (!command.bot && message.author.bot) {
                    Logger.info("[BotCommands] Bot can't use this command");
                    break;
                }
                if (member !== undefined && member !== null) {
                    if (!member.permissions.has(command.permissions)) {
                        Logger.info("[BotCommands] This user not enough permission!");
                        break;
                    }
                }
                if (!command.dm && channel.type === "dm") {
                    Logger.info("[BotCommands] This command can't use in Direct Message");
                    break;
                }
                if (command.nsfw && !channel.nsfw) {
                    Logger.info("[BotCommands] This command require nsfw channel!");
                    break;
                }
                await command.execute(commandLabel, commandArgs, message, member, channel);
                Logger.info("[BotCommands] Command executed!");
                break;
            }
        }
    } else if (channel.type === "dm" && !message.author.bot) {
        imis.reply(message);
    }
});