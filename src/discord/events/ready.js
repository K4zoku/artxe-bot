module.exports = new Event("ready", async () => {
	Logger.info(`Logged-in as ${discord.client.user.tag}`);
});