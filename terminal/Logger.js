const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const {__rootdir} = require('../root');
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
class Logger {
    constructor(logPath, logFile) {
        this.logPath = logPath.endsWith("/")?logPath:logPath+"/";
        this.logFile = logFile;
        preload(this.logPath, this.logFile);
        this.warns = [];
        this.errors = [];
    }

    info(msg) {
        return log(msg, "INFO", this.logPath, this.logFile);
    }

    error(err) {
        process.stats.errorCount++;
        let logEntry = log(COLOR.FgRed+err+COLOR.Reset, COLOR.FgRed+"ERROR"+COLOR.Reset, this.logPath, this.logFile);
        this.errors.push(logEntry);
        return logEntry;
    }

    warning(warn) {
        process.stats.warningCount++;
        let logEntry = log(COLOR.FgYellow+warn+COLOR.Reset, COLOR.FgYellow+"WARN"+COLOR.Reset, this.logPath, this.logFile);
        this.warns.push(logEntry);
        return logEntry;
    }

    debug(msg, debugEnabled=process.debugEnabled) {
        return debugEnabled ? log(COLOR.FgBlue+msg+COLOR.Reset, COLOR.FgBlue+"DEBUG"+COLOR.Reset, this.logPath, this.logFile) : "";
    }
}

module.exports = new Logger(path.join(__rootdir, 'logs'), "latest.log");
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

function fileNewName(path, filename) {
    let pos = filename.lastIndexOf('.log.gz');
    let name;
    let ext;
    if (pos > -1) {
        name = filename.slice(0, pos);
        ext = filename.slice(pos, filename.length);
    } else {
        name = filename;
    }
    let newName = filename;
    let counter = 1;
    let newPath = path + '/' + filename;

    while (fs.existsSync(newPath)) {
        newName = name + '-' + counter + ext;
        newPath = path + '/' + newName;
        counter++;
    }
    return newName;
}
const readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout);

function log(content="", logType="", logPath, logFile) {
    let current = (new Date()).toTimeString().split(' ')[0];
    logType = logType !== "" ? " " + logType : "";
    let logEntry = `[${COLOR.FgGreen}${current}${COLOR.Reset}${logType}]: ${content}`;
    process.stdout.write("\r" + logEntry + "\n");
    process.stdout.write("\rαΓτΧε> "); // Prompt
    fs.appendFile(path.join(logPath, logFile), logEntry + "\n", err => {
        if(err) console.error(err);
    });
    return logEntry;
}