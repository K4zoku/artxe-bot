
const {stat, rename, unlink} = require("fs").promises;
const {fileExists, fileNewName, gzip} = require("./util");
const {join} = require("path");
const winston = require("winston");
const colors = require("./tty/colors");

const timestampFormat = process.global.config.logger.timestamp;

module.exports = async () => archive().then(() => initLogger());

const logPath = join(process.global.src, "logs");
const logFileName = "latest.log";

async function archive() {
    const logFile = join(logPath, logFileName);
    if (!(await fileExists(logFile))) return;
    const ctime = (await stat(logFile)).ctime;
    const name = `${ctime.getFullYear()}-${ctime.getMonth()+1}-${ctime.getDate()}`;
    const newName = await fileNewName(logPath, name, "log.gz");
    const newLogFile = newName.slice(0, -3); // remove .gz
    return rename(logFile, newLogFile)
        .then(() => gzip(newLogFile, newName))
        .then(() => unlink(newLogFile))
        .catch(console.error);
}

function format(log, colorize=false) {
    let level = log.level.toUpperCase();
    if (colorize) {
        let color;
        switch (level) {
            case "INFO":
                color = colors.fg.green;
                break;
            case "WARNING":
            case "WARN":
                color = colors.fg.yellow;
                break;
            case "CRITICAL":
            case "ERROR":
                color = colors.fg.red;
                break;
            case "DEBUG":
                color = colors.fg.blue;
                break;
            default: 
                color = colors.fg.white;
                break;
        }
        level = colors.colorize(level, color);
    }
    return `[${log.timestamp} ${level}]: ${log.stack ?? log.message}`
}

async function initLogger() {
    const {stdin, stdout} = process;
    const isTTY = stdin.isTTY && stdout.isTTY;            

    return process.global.logger = winston.createLogger({
        exitOnError: false,
        format: winston.format.timestamp({format: timestampFormat}),
        transports: [
            new winston.transports.Console({
                format: winston.format.printf(log => (isTTY ? "\r" : "") + format(log, isTTY))
            }),
            new winston.transports.File({
                format: winston.format.printf(log => format(log)),
                dirname: logPath,
                filename: logFileName
            })
        ],
    });
}