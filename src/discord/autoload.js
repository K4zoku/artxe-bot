const {readdir} = require("fs").promises;
const {join} = require("path");
const loggerOpts = {
	label: "Discord",
}

module.exports = async () => invoke("discord/client")
	.then(client => Promise.all([
		loadCommands(),
		loadEvents(client)
	])).catch(e => error(e, loggerOpts));

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
	const writer = (content, message) =>
		message && typeof message.reply === "function" &&
		message.reply(content).catch(error);
	const discordCM = new CommandManager({
		writer: new Writer(writer),
		feedback: new CommandFeedback({
			commandNotFound: "Command `{label}` not found!"
		})
	});
	discord.command = {
		manager: discordCM
	}
	await discordCM.loadCommands(join(__src, "discord/commands"));
}