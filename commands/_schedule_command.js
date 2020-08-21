const BotCommand = require('./BotCommand');
const schedule = require('node-schedule');
const Logger = require('../terminal/Logger');

module.exports = new BotCommand(
    "schedule_command",
    ["sc"],
    "Schedule run command of this bot",
    "sc {ScheduleString} {command}",
    undefined,
    async (commandLabel, commandArgs, message, member, channel) => {
        let cronExpress = commandArgs.shift().split("|").join(" ");
        let sCommand = commandArgs.join(" ");
        await channel.send(`Schedule command \`${sCommand}\` at ${cronExpress}`);
        schedule.scheduleJob(cronExpress, () => {
            channel.send(sCommand).then((sent) => {
                sent.delete(1000).catch(Logger.error);
            }).catch(Logger.error);
        });
    },
    0,
    false,
    false,
    ["ADMINISTRATOR"],
    true,
    false
);

