const {src} = process.global;
const {join} = require("path");
const Command = require(join(src, "core", "command", "command"));
const {MessageAttachment, MessageEmbed} = require("discord.js");
const {render, getData} = require(join(src, "core", "app", "ncov", "ncov"));
const {logger} = process.global;

const MESSAGES = {
    COUNTRY_NOT_FOUND: "```diff\n- ERROR: Country not found\n```",
    ERROR: "```diff\n- ERROR: An error occurred\n```"
}

module.exports = new Command({
	label: "simsimi",
    aliases: ["sim", "autochat"],
    description: "Simsimi",
    usage: "simsimi [toggle|on|off|{message}]",
    execute: execute,
    data: {
    	modifier: 0x6,
    	permissions: []
    }
});

async function execute(args, message) {
    const {id} = message.author;
    switch (args.length) {
        case 0:
            toogle(message);
            break;
        case 1:
            switch (args[0].toLowerCase()) {
                case "toggle":
                    toggle(message);
                    break;
                case "on":
                case "true":
                    toogle(message, true);
                    break;
                case "off":
                case "false":
                    toogle(message, false);
                    break;
                default:
                    chat(message, args[0]);
                    break;
            }
            break;
        default:
            const text = args.join(" ");
            chat(message, text);
            break;
    }
}


async function chat(message, text) {
    const {reply} = require(join(src, "core", "app", "simsimi", "simsimi"));
    const c = await reply(text) ?? "Wat r u saying?";
    message.channel.send(`> ${message.content}\n${message.author} ${c}`);
}

function toogle(message, t) {
    const {id} = message.author;
    const {users} = process.global.discord.simsimi;
    if (!users) return;
    if (t ?? (!users.has(id) || !users.get(id))) {
        users.set(id, true);
        message.channel.send("Simsimi mode: on");
    } else {
        users.set(id, false);
        message.channel.send("Simsimi mode: off");
    }
}
