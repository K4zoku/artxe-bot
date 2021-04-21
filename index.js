global.Logger = console; // fallback
global.error = e => Logger.error(e.stack || e);
const fs = require("mz/fs");
const path = require("path");
async function walk(dir) {
	const subdirs = await fs.readdir(dir);
	const files = await Promise.all(subdirs.map(async (subdir) => {
		const res = path.resolve(dir, subdir);
		return (await fs.stat(res)).isDirectory() ? walk(res) : res;
	}));
	return files.reduce((a, f) => a.concat(f), []);
}

(async () => {
	Logger.info("Initializing...");
	global.__root = __dirname;
	global.__src = path.join(__dirname, "src");
	global.__ = _path => require("./" + path.join("src", _path));
	global.invoke = (path, ...params) => __(path)(params);
	// noinspection JSValidateTypes
	global.fetch = require("node-fetch");
	global.config = {
		discord: require("./configuration/discord.json"),
		logger: require("./configuration/logger.json"),
		tty: require("./configuration/tty.json"),
	}
	invoke("util/placeholder");
	let files = await walk(path.join(__src, "struct"));
	files.map(require).forEach(_class => global[_class.name] = _class);
	setInterval(_ => fetch(process.env.HEROKU_URL, {method: "HEAD"}).then(_ => Logger.info("Wake the f*** up Samurai")), 1740000)
})()
	.then(() => invoke("util/logger")) // init logger
	.catch(e => {
		error(e);
		process.exit(1);
	}) // display error and stop when init logger failed
	.then(() => invoke("http/server", Logger))
	.then(() => invoke("database/client"))
.then(() => invoke("tty/autoload")) // load tty
.then(() => invoke("discord/autoload")) // load discord
.catch(error);