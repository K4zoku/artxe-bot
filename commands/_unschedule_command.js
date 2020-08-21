const BotCommand = require('./BotCommand');
const schedule = require('node-schedule');
const Logger = require('../terminal/Logger');

module.exports = new BotCommand(
    "unschedule_command",
    ["uc"],
    "Unschedule a task",
    "uc {taskID}",
    undefined,
    async (commandLabel, commandArgs, message, member, channel) => {
        let taskId = commandArgs[0];
        let task =  schedule.scheduledJobs[taskId];
        if (task !== undefined && task !== null) {
            task.cancel();
            Logger.debug("Task removed: " + taskId);
            await channel.send(`Unscheduled task \`${taskId}\``);
        }
    },
    0,
    false,
    false,
    ["ADMINISTRATOR"],
    true,
    false
);

