const BotCommand = require('./BotCommand');
const schedule = require('node-schedule');
const Logger = require('../terminal/Logger');
const md5 = require('md5');
let scheduleTasks = [];
module.exports = new BotCommand(
    "schedule_command",
    ["sc"],
    "Schedule run command of this bot",
    "sc {ScheduleString} {command}",
    undefined,
    async (commandLabel, commandArgs, message, member, channel) => {
        let cronExpress = commandArgs.shift().replaceAll("`", "").split("|").join(" ");
        let sCommand = commandArgs.join(" ");
        let taskId = md5(scheduleTasks.length).substr(5,5).toUpperCase();
        scheduleTasks.push(taskId);
        await channel.send(`[\`${taskId}\`] Schedule command \`${sCommand}\` at ${cronExpress}`);
        schedule.scheduleJob(taskId, cronExpress, (fireDate) => {
            Logger.debug("Job executed: " + fireDate);
            channel.send(sCommand).then((sent) => {
                sent.delete({timeout: 1000}).catch(Logger.error);
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

