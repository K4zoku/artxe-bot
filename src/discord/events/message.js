const path = require("path");
const fs = require("mz/fs");
const {MessageAttachment} = require("discord.js");
const {hasMod, mods} = __("discord/modifiers");

discord.simsimi = {
    users: new Map()
};

const {reply} = __("app/simsimi");

async function simsimiListener(message) {
    await message.reply(await reply(message.content) || "Wat r u saying?");
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

const {isIllegal} = __("app/nineline-detector");

async function imageListener(message) {
    let attachments = message.attachments;
    if (attachments.length === 0) return false;
    const acceptable = ["png", "jpg", "jpeg"];
    for (let [, attachment] of attachments) {
        let found = acceptable.find(ext => attachment.name.toLowerCase().endsWith(ext));
        if (!found) return;
        let buffer = (await fetch(attachment.url).then(_ => _.buffer()));
        if (await isIllegal(buffer, found)) {
            let img = await fs.readFile(path.join(__src, "app/wti.jpg"));
            img = new MessageAttachment(img, "wait-that-illegal.jpg");
            let msg = await message.channel.send("Wait. That's illegal", img);
            if (message.channel.type === "text" && message.channel.permissionsFor(discord.client.user).has("MANAGE_MESSAGES")) {
                Logger.info("Detected illegal image, deleting...");
                await message.delete({timeout: 5000, reason: "Illegal image"}).then(_ => msg.delete());
            }
            break;
        }
    }

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


let listeners = [
    {
        listen: imageListener,
        filter: message => {
            if (message.author.id === discord.client.user.id) return false;
            let attachments = message.attachments;
            if (attachments.length === 0) return false;
            const acceptable = ["png", "jpg", "jpeg"];
            return attachments.some(attachment => acceptable.some(ext => attachment.name.toLowerCase().endsWith(ext)))
        }
    },
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
module.exports = new Event("message", async (message) => {
    await listeners.find(listener => filter(listener.filter, message)).listen(message);
});