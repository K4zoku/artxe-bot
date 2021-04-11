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
	label: "ncov",
    aliases: ["corona", "covid-19"],
    description: "Show nCoV statitics",
    usage: "ncov [country_code]",
    execute: execute,
    data: {
    	modifier: 0x6,
    	permissions: []
    }
});

async function execute(args, message) {
    const {channel} = message;
    return getData(args.join(" "))
        .catch(() => channel.send(MESSAGES.COUNTRY_NOT_FOUND))
        .then(async data => {
            if (!data) return false;
            const where = data.country ?? "Global";
            const buffer = await render(data);
            const name = `ncov-stats-${where.toLowerCase()}.png`;
            const attachment = new MessageAttachment(buffer, name);
            const embed = new MessageEmbed()
                .setTitle(`:microbe: ${where} nCoV stats`)
                .setColor(247707)
                .setFooter("Updated at")
                .setTimestamp(new Date(data.updated))
                .attachFiles(attachment)
                .setImage(`attachment://${name}`);
            channel.send(embed);
            return true;
        }).catch(error => {
            channel.send(MESSAGES.ERROR)
            logger.error(error.stack);
        });
}