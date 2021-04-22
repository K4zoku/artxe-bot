module.exports = new Event("ready", async () => {
	Logger.info(`Logged-in as ${discord.client.user.tag}`, {label: "Discord"});
	config.discord.prefixes = config.discord.prefixes.map(prefix => placeholder(prefix, {bot_id: discord.client.user.id}));
});