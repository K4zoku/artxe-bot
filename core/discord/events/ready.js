const {join} = require("path");
const Event = require("../event");
const {src, logger, discord} = process.global;
const client = discord.client;

module.exports = new Event("ready", async () => {
	logger.info(`Logged-in as ${client.user.tag}`);
});