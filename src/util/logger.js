const {exists, stat, rename, unlink} = require("mz/fs");
const {createReadStream, createWriteStream} = require("fs");
const {createGzip} = require("zlib");
const {join} = require("path");
const winston = require("winston");
const colors = require("../tty/colors");

module.exports = async () => archive().then(() => initLogger());

const logPath = join(__root, "logs");
const logFileName = "latest.log";
async function fileNewName(path, name, ext = "", format = f => join(f.path, `${f.name}-${f.n}.${f.ext}`)) {
    let f = {
        path: path,
        name: name,
        ext: ext,
        n: 1
    }
    let fullPath;
    while (await exists(fullPath = await format(f))) f.n++;
    return fullPath;
}

async function gzip(input, output) {
    const gzip = createGzip();
    const source = createReadStream(input);
    const destination = createWriteStream(output);
    return source.pipe(gzip).pipe(destination);
}

async function archive() {
    const logFile = join(logPath, logFileName);
    if (await exists(logFile)) {
        const ctime = (await stat(logFile)).ctime;
        const name = `${ctime.getFullYear()}-${ctime.getMonth() + 1}-${ctime.getDate()}`;
        const newName = await fileNewName(logPath, name, "log.gz");
        const newLogFile = newName.slice(0, -3); // remove .gz
        return rename(logFile, newLogFile)
            .then(_ => gzip(newLogFile, newName))
            .then(ws => ws.on("end", _ => unlink(newLogFile)));
    }
}

function format(log, color=false) {
    let level = log.level.toUpperCase();
    if (color) level = colorize(level);
    return `[${log.timestamp} ${level}]: ${log.stack ?? log.message}`
}

function colorize(level) {
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
    return colors.colorize(level, color);
}

async function initLogger() {
    const {stdin, stdout} = process;
    const isTTY = stdin.isTTY && stdout.isTTY;            

    return global.Logger = winston.createLogger({
        exitOnError: false,
        format: winston.format.timestamp({format: config.logger.timestamp}),
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