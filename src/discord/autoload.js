const {readdir} = require("fs").promises;
const {join} = require("path");
const loggerOpts = {
	label: "Discord",
}

module.exports = async () => require("./client")()
	.then(client => Promise.all([
		loadCommands(),
		loadEvents(client)
	]));

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
	Logger.info("Loading Discord commands...", loggerOpts);
    const discordCM = new CommandManager({
    	writer: new Writer((content, message) => message.reply(content)),
		feedback: new CommandFeedback()
    });
    discordCM.loadCommands(join(__src, "discord/commands"))
        .catch(error => Logger.error(error.stack ?? error, loggerOpts));
    discord.command = {
    	manager: discordCM
    }
}