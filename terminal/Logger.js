const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const {__rootdir} = require('../root');
const {fileNewName} = require('../handler/utils');
const COLOR = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
};
const constLogPath = path.join(__rootdir, 'logs');
const constLogFile = "latest.log"
class Logger {
    constructor(logPath, logFile) {
        this.logPath = logPath.endsWith("/")?logPath:logPath+"/";
        this.logFile = logFile;
        preload(this.logPath, this.logFile);
    }

    info(msg) {
        let logPath = this !== undefined ? this.logPath : constLogPath;
        let logFile = this !== undefined ? this.logFile : constLogFile;
        return log(msg, "INFO", logPath, logFile);
    }

    error(err) {
        process["stats"].errorCount++;
        let logPath = this !== undefined ? this.logPath : constLogPath;
        let logFile = this !== undefined ? this.logFile : constLogFile;
        return log(COLOR.FgRed + err + COLOR.Reset, COLOR.FgRed + "ERROR" + COLOR.Reset, logPath, logFile);
    }

    warning(warn) {
        process["stats"].warningCount++;
        let logPath = this !== undefined ? this.logPath : constLogPath;
        let logFile = this !== undefined ? this.logFile : constLogFile;
        return log(COLOR.FgYellow+warn+COLOR.Reset, COLOR.FgYellow+"WARN"+COLOR.Reset, logPath, logFile);
    }

    debug(msg, debugEnabled=process["internal"]["settings"]["debug"]) {
        let logPath = this !== undefined ? this.logPath : constLogPath;
        let logFile = this !== undefined ? this.logFile : constLogFile;
        return debugEnabled ? log(COLOR.FgBlue+msg+COLOR.Reset, COLOR.FgBlue+"DEBUG"+COLOR.Reset, logPath, logFile) : "";
    }
}

module.exports = new Logger(constLogPath, constLogFile);
module.exports.classes = Logger;

function preload(logPath, logFile) {
    if (fs.existsSync(path.join(logPath, logFile))) {
        const lastModified = fs.statSync(logPath + logFile).mtime;
        const nameFormatted = `${lastModified.getFullYear()}-${lastModified.getMonth()+1}-${lastModified.getDate()}`;
        let newName = fileNewName(logPath, nameFormatted + ".log.gz").replace(".gz", "");
        fs.renameSync(path.join(logPath, logFile), path.join(logPath, newName));
        let fileContents = fs.createReadStream(path.join(logPath, newName));
        let writeStream = fs.createWriteStream(path.join(logPath, newName + ".gz"));
        let zip = zlib.createGzip();
        fileContents.pipe(zip).pipe(writeStream).on('finish', (err) => {
            if (err) console.error(err);
        });
        fs.unlinkSync(path.join(logPath, newName));
    }
}

function log(content="", logType="", logPath, logFile) {
    let current = (new Date()).toTimeString().split(' ')[0];
    logType = logType !== "" ? " " + logType : "";
    let logEntry = `[${COLOR.FgGreen}${current}${COLOR.Reset}${logType}]: ${content}`;
    if (process["internal"]["terminal-input"]) {
        process.stdout.write("\r" + logEntry + "\n");
        process.stdout.write("\rαΓτΧε> "); // Prompt
    } else {
        console.log(logEntry);
    }
    fs.appendFile(path.join(logPath, logFile), logEntry + "\n", () => {});
    return logEntry;
}