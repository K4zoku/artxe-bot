const BotCommand = require('./BotCommand');

module.exports = new BotCommand(
    "say",
    ["echo"],
    "Send a copy of args",
    "say this is example",
    undefined,

    (commandLabel, commandArgs, message, member, channel) => {
        message.delete().catch();
        channel.send(commandArgs.join(" "));
    },
    0,
    false,
    false,
    ["MANAGE_MESSAGES"],
    true,
    false
);
