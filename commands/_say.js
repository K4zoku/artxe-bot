const BotCommand = require('./BotCommand');
const Logger = require('../terminal/Logger')
const {fallback} = require("../handler/utils");

module.exports = new BotCommand(
    "say",
    ["echo"],
    "Send a copy of args",
    "say this is example",
    undefined,
    async (commandLabel, commandArgs, message, member, channel) => {
        await message.delete().catch(Logger.error);
        if (isNaN(commandArgs[0])) {
            await channel.send(commandArgs.join(" "));
        } else {
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
