const {MessageAttachment, MessageEmbed} = require("discord.js");
const {render, getData} = __("app/ncov/ncov");

const MESSAGES = {
    COUNTRY_NOT_FOUND: "```diff\n- ERROR: Country not found\n```",
    ERROR: "```diff\n- ERROR: An error occurred\n```"
}

module.exports = new Command({
	label: "ncov",
    aliases: ["corona", "covid-19"],
    description: "Show nCoV statistics",
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
        .then(async data => {
            data.status === 404 && channel.send(MESSAGES.COUNTRY_NOT_FOUND);
            if (data.status !== 200) return false;
            data = await data.json();
            const where = data.country ?? "Global";
            const wr = ((data.countryInfo && data.countryInfo.iso2) ?? "g").toLowerCase();
            const flag = (data.countryInfo && data.countryInfo.flag) ?? 
                "https://via.placeholder.com/250x167.png?text=GLOBAL"; // default flag
            const buffer = await render(data);
            const name = `ncov-stats-${wr}.png`;
            const attachment = new MessageAttachment(buffer, name);
            const embed = new MessageEmbed()
                .setColor(0x03c79b)
                .setThumbnail(flag)
                .setAuthor(`${where} nCoV statistics`, flag)
                .setFooter("Last updated")
                .setTimestamp(new Date(data.updated))
                .attachFiles([attachment])
                .setImage(`attachment://${name}`);
            channel.send(embed);
            return true;
        }).catch(e => {
            channel.send(MESSAGES.ERROR);
            error(e.stack);
        });
}