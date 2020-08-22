const BotCommand = require('./BotCommand');
const Logger = require('../terminal/Logger')
const {fallback} = require('../handler/utils');
const {owner} = require('../configurations/bot-settings.json');

module.exports = new BotCommand(
    "say",
    ["echo"],
    "Send a copy of args",
    "say this is example",
    undefined,
    async (commandLabel, commandArgs, message, member, channel) => {
        if (channel.type === "text")
            await message.delete().catch(Logger.error);
        if (isNaN(commandArgs[0])) {
            await channel.send(commandArgs.join(" "));
        } else if (member.id === owner || member.id === process["internal"]["discord"]["client"].id) {
            let cid = commandArgs.shift();
            fallback(
                process["internal"]["discord"]["client"].channels.cache.get(cid),
                process["internal"]["discord"]["client"].users.cache.get(cid),
                channel
            ).send(commandArgs.join(" "));
        }
    },
    0,
    false,
    false,
    ["MANAGE_MESSAGES"],
    true,
    false
);
