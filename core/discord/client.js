const {join} = require('path');
const {Client} = require('discord.js');
const logger = process.global.logger;
const token = require(join(process.global.src, 'configuration', 'discord.json'))["bot-token"];
const client = new Client();
client.login(token).catch(e => logger.error(e));

process.global.discord = {
	token: token,
	client: client
}