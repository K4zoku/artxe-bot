const {join} = require("path");
const {MessageEmbed} = require("discord.js");

const help = new Command({
	label: "help",
    aliases: ["?", "h"],
    description: "Show help",
    usage: "help [command]",
    execute: execute,
    data: {
    	modifier: 0x6,
    	permissions: []
    }
});

async function execute(args, message) {
    const channel = message.channel;
	const cm = help.getCommandManager();
    switch (args.length) {
        case 0:
            channel.send(
            	new MessageEmbed()
	            	.setColor(0x2E39FF)
	            	.setTitle("**All available commands:**")
	            	.setDescription(
	            		cm.getRegistered()
		                	.map(cmd => `\`${cmd.label}\` - _${cmd.description}_`)
		                	.join("\n")
	                )
            );
            return true;
        case 1:
            if (!cm.hasCommand(args[0])) {
            	channel.send(`No help available for '_${args[0]}_'`);
            	return false;
            }
            const command = cm.getCommand(args[0]);
            channel.send(new MessageEmbed()
            	.setColor(0x2E39FF)
            	.setTitle(`Showing help for \`${command.label}\``)
            	.setDescription(
            		[
            			`**Description:** _${command.description}_`,
            			`**Aliases:** [${command.aliases.join(", ") || " "}]`,
            			`**Usage:** \`${command.usage}\``
            		].join("\n")
            	)
            );
            return true;
        default:
        	channel.send(`**Usage:** \`${help.usage}\``);
            return false;
    }
}

module.exports = help;