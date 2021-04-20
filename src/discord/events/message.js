const {hasMod, mods} = __("discord/modifiers");
const {prefix} = config.discord;
module.exports = new Event("message", async (message) => {
    await listeners.find(l => l.filter(message)).listener(message);
});

let listeners = [
    {
        listener: commandListener,
        filter: msg => msg.content.startsWith(prefix)
    },
    {
        listener: simsimiListener,
        filter: () => true
    },
]

discord.simsimi = {
    users: new Map()
};

async function simsimiListener(message) {
    const users = discord.simsimi.users;
    const id = message.author.id;
    if (!(users.has(id) && users.get(id))) return;
    const {reply} = __("app/simsimi");
    const sim = await reply(message.content);
    message.reply(sim ?? "Wat r u saying?");
    // {allowedMentions: {repliedUser: false}}
}

async function commandListener(message) {
    const content = message.content;
    if (!content.startsWith(prefix)) return false;
    Logger.info(`User ${message.author.tag} issued bot command: ${content}`);
    let rawCommand = content.substr(prefix.length);
    await discord.command.manager.execute(rawCommand, message, commandValidate);
    Logger.info("Command executed!");
    return true;
}

function commandValidate(command, message) {
    if (!command instanceof Command) return false;
	const {modifier, permissions} = command.data;
	const {author, channel, member} = message;
	const {owner} = config.discord;
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