const {readdir} = require("fs").promises;
const Event = require("./event");
const {join} = require("path");

const {src, logger} = process.global;

module.exports = async () => require("./client")()
	.then(client => loadEvents(client));

const eventDirectory = join(src, "core", "discord", "events");
const loadEvents => async (client) {
	(await readdir(eventDirectory))
		.filter(file => file.toLowerCase().endsWith(".js"))
        .map(file => join(eventDirectory, file))
        .map(require)
        .filter(object => object instanceof Event) // Event[]
        .forEach(event => event.register(client))
}