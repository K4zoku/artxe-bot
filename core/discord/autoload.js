const fsp = require("fs").promises;
const Event = require("./event");
const {join} = require("path");

require("./client");
const src = process.global.src;
const logger = process.global.logger;
const client = process.global.discord.client;

loadEvent(join(src, "core", "discord", "events")).catch(error => logger.error(error));

async function loadEvent(directory) {
	let files = await fsp.readdir(directory);
	files.filter(file => file.toLowerCase().endsWith(".js"))
        .map(file => join(directory, file))
        .map(require)
        .filter(object => object instanceof Event) // Event[]
        .forEach(event => event.register(client))
}