const {src, logger} = process.global;
const {readdir} = require("fs").promises;
const Event = require("./event");
const {join} = require("path");
const CommandManager = require(join(src, "core", "command", "command_manager"));


module.exports = async () => require("./client")()
	.then(client => {
		loadCommands();
		loadEvents(client);
	});

const eventDirectory = join(src, "core", "discord", "events");
const loadEvents = async (client) => {
	(await readdir(eventDirectory))
		.filter(file => file.toLowerCase().endsWith(".js"))
        .map(file => join(eventDirectory, file))
        .map(require)
        .filter(object => object instanceof Event) // Event[]
        .forEach(event => event.register(client))
}

const loadCommands = async () => {
	logger.info("Loading Discord commands...");
    const discordCM = new CommandManager({
    	writer: (content, message) => message.channel.send(content)
    });
    discordCM.loadCommands(join(src, "core", "discord", "commands"))
        .catch(error => logger.error(error.stack));
    process.global.discord.command = {
    	manager: discordCM
    }
}