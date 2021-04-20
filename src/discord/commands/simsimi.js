const {join} = require("path");

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
            toggle(message);
            break;
        case 1:
            switch (args[0].toLowerCase()) {
                case "toggle":
                    toggle(message);
                    break;
                case "on":
                case "true":
                    toggle(message, true);
                    break;
                case "off":
                case "false":
                    toggle(message, false);
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
    const {reply} = __("app/simsimi/simsimi");
    return message.reply(await reply(text) ?? "Wat r u saying?");
}

function toggle(message, t) {
    const id = message.author.id;
    const users = discord.simsimi.users;
    if (!users) return;
    t = !!(t ??  !(users.has(id) && users.get(id)));
    users.set(id, t);
    message.reply("Simsimi mode: "+ (t ? "on" : "off"));
}
