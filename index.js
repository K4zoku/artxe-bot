global.Logger = console; // fallback
global.error = e => Logger.error(e.stack || e);
global.critical = e => error(e) || process.exit(1);
const fs = require("mz/fs");
const path = require("path");

async function traverse(dir) {
    let result = [];
    let child = await fs.readdir(dir);
    while (child.length > 0) {
        let childName = child.shift();
        let childPath = path.join(dir, childName);
        if (!(await fs.stat(childPath)).isDirectory()) {
            result.push(childPath);
            continue;
        }
        let grandChild = await fs.readdir(childPath);
        grandChild = grandChild.map(grandChildName => path.join(childName, grandChildName));
        child.push(...grandChild);
    }
    return result;
}

(async () => {
    Logger.info("Initializing...");
    global.__root = __dirname;
    global.__src = path.join(__dirname, "src");
    global.__ = _path => require("./" + path.join("src", _path));
    global.invoke = async (path, ...params) => __(path)(params);
    // noinspection JSValidateTypes
    global.fetch = require("node-fetch");
    global.config = {
        discord: require("./configuration/discord.json"),
        logger: require("./configuration/logger.json"),
        tty: require("./configuration/tty.json"),
    };
    (await traverse(path.join(__src, "struct")))
        .map(require)
        .forEach(_class => global[_class.name] = _class);

    process.env.HEROKU_URL &&
    setInterval(_ => fetch(process.env.HEROKU_URL).catch(error), 25 * 60 * 1000);
})()
    .then(_ => invoke("util/placeholder"))
    .then(_ => invoke("util/logger")) // init logger
    .catch(critical) // display error and stop when init logger failed
    .then(_ => invoke("database/client"))
    .then(_ => invoke("http/server", Logger))
    .then(_ => invoke("tty/autoload")) // load tty
    .then(_ => invoke("discord/autoload")) // load discord
    .catch(error);