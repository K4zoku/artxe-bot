const ConsoleCommand = require('./TerminalCommand');
const Logger = require('../Logger');
const date = require('date-and-time');

module.exports = new ConsoleCommand(
    "uptime",
    [],
    "View uptime",
    "uptime",
    () => {
        let now = new Date();
        let uptime = date.subtract(now, process["stats"]["startTime"]).toSeconds();
        let d = ~~(uptime / (3600 * 24));
        let h = ~~(uptime % (3600 * 24) / 3600);
        let m = ~~(uptime % 3600 / 60);
        let s = ~~(uptime % 60)
        Logger.info(`Uptime: ${d} day${d>1?"s":""} ${h} hour${h>1?"s":""} ${m} minute${m>1?"s":""} ${s} second${s>1?"s":""}`);
    }
)