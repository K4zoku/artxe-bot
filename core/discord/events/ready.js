const Event = require("../event");
const logger = process.global.logger;
const client = process.global.discord.client;
module.exports = new Event("ready", async () => {
	logger.info(`Logged-in as ${client.user.tag}`);
});