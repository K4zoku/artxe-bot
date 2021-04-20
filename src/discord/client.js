const {Client} = require('discord.js');
module.exports = async () => {
	const client = new Client();
	return (async () => 
		config.discord["bot-token"] || 
		process.env.DISCORD_TOKEN ||
		(shell && shell.asyncAsk("bot-token is empty, please input bot token here: "))
	)()
	.then(token => client.login(token))
	.then(token => {
		global.discord = {
			token: token,
			client: client
		};
		return client;
	});
};