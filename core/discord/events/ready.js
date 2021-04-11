const {join} = require("path");
const Event = require("../event");
const {src, logger, discord} = process.global;
const CommandManager = require(join(src, "core", "command", "command_manager"));
const client = discord.client;

module.exports = new Event("ready", async () => {
	logger.info(`Logged-in as ${client.user.tag}`);
	await loadCommands();
});

async function loadCommands() {
	logger.info("Loading Discord commands...");
    const discordCM = new CommandManager({
    	writer: (content, message) => message.reply(content)
    });
    discordCM.loadCommands(join(src, "core", "discord", "commands"));
    process.global.discord.command = {
    	manager: discordCM
    }
}