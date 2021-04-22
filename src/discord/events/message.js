const {hasMod, mods} = __("discord/modifiers");

let listeners = [
    {
        listen: commandListener,
        filter: message => message.author.id !== discord.client.user.id &&
            config.discord.prefixes.some(prefix => message.content.startsWith(prefix)),
    },
    {
        listen: simsimiListener,
        filter: message => message.author.id !== discord.client.user.id &&
            (
                message.channel.type === "dm" ||
                discord.simsimi.users.has(message.author.id) &&
                discord.simsimi.users.get(message.author.id)
            )
    },
    {
        listen: _ => {
        },
        filter: _ => true,
    }
]

discord.simsimi = {
    users: new Map()
};

const {reply} = __("app/simsimi");
async function simsimiListener(message) {
    await message.reply(await reply(message.content) ?? "Wat r u saying?");
    // {allowedMentions: {repliedUser: false}}
}

async function commandListener(message) {
    const content = message.content;
    let prefix = config.discord.prefixes.find(p => message.content.startsWith(p));
    let rawCommand = content.substr(prefix.length).trim();
    Logger.info(`User ${message.author.tag} issued bot command: ${rawCommand}`, {label: "Discord"});
    await discord.command.manager.execute(rawCommand, message, commandValidate);
    Logger.info("Command executed!", {label: "Discord"});
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

const filter = (filter, data) => {
    if (typeof filter !== "function") return false;
    try {
        return filter(data);
    } catch (e) {
        error(e);
        return false;
    }
}
module.exports = new Event("message", async (message) => {
    await listeners.find(listener => filter(listener.filter, message)).listen(message);
});