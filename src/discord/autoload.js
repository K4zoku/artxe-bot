const {readdir} = require("fs").promises;
const {join} = require("path");

module.exports = async () => require("./client")()
	.then(client => {
		loadCommands();
		loadEvents(client);
	});

const eventDirectory = join(__src, "discord/events");
const loadEvents = async (client) => {
	(await readdir(eventDirectory))
		.filter(file => file.toLowerCase().endsWith(".js"))
        .map(file => join(eventDirectory, file))
        .map(require)
        .filter(object => object instanceof Event) // Event[]
        .forEach(event => event.register(client))
}

const loadCommands = async () => {
	Logger.info("Loading Discord commands...");
    const discordCM = new CommandManager({
    	writer: (content, message) => message.channel.send(content)
    });
    discordCM.loadCommands(join(__src, "discord/commands"))
        .catch(error => Logger.error(error.stack ?? error));
    discord.command = {
    	manager: discordCM
    }
}