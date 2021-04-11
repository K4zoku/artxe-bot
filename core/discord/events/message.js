const Event = require("../event");
const {hasMod, mods} = require("../modifiers");
const {logger, config, discord} = process.global;
const {prefix} = config.discord;
module.exports = new Event("message", async (message) => {
	if (await commandListener(message)) return;
    await simsimiListener(message);
});

process.global.discord.simsimi = { 
    users: new Map()
};

async function simsimiListener(message) {
    const {join} = require("path");
    const {discord, src} = process.global;
    const {users} = discord.simsimi;
    const id = message.author.id;
    if (!users.has(id)) return;
    const {reply} = require(join(src, "core", "app", "simsimi", "simsimi"));
    const sim = await reply(message.content);
    message.reply(sim ?? "Wat r u saying?");
}

async function commandListener(message) {
    const content = message.content;
    if (!content.startsWith(prefix)) return false;
    logger.info(`User ${message.author.tag} issued bot command: ${content}`);
    let rawCommand = content.substr(prefix.length);
    const {manager} = process.global.discord.command;
    manager.execute(rawCommand, message, validate);
    logger.info("Command executed!");
    return true;
}

function validate(command, message) {
	const {modifier, permissions} = command.data;
	const {author, channel, member} = message;
	const {owner} = process.global.config.discord;
	if (hasMod(modifier, mods.ONLY_OWNER) && author.id !== owner) {
        message.reply("Only owner can use this command");
        return false;
    }
    if (!hasMod(modifier, mods.ALLOW_BOT) && message.author.bot) {
        message.reply("Bot can't use this command");
        return false;
    }
    if (channel.type === "text" && !member.permissions.has(permissions)) {
        message.reply("Not enough permission!");
        return false;
    }
    if (!hasMod(modifier, mods.ALLOW_DM) && channel.type === "dm") {
        message.reply("This command can't use in Direct Message");
        return false;
    }
    if (hasMod(modifier, mods.ONLY_NSFW) && !channel.nsfw) {
        message.reply("This command require nsfw channel!");
        return false;
    }
    return true;
}