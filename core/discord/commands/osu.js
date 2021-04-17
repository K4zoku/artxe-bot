const {src} = process.global;
const {join} = require("path");
const Command = require(join(src, "core", "command", "command"));
const {MessageEmbed} = require("discord.js");
const osu = require(join(src, "core", "app", "osu", "osu"));
const {logger} = process.global;

const MESSAGES = {
    ERROR: "```diff\n- ERROR: An error occurred\n```"
}
const osuCmd = new Command({
    label: "osu",
    aliases: ["oxu", "o"],
    description: "Osu!Command",
    usage: "osu <user|u|beatmap|bm> <id> [beatmap|user opts...]",
    execute: execute,
    data: {
        modifier: 0x6,
        permissions: []
    }
});

module.exports = osuCmd;

function beatmapLinkExplode(url) {
    url = url.replace("https://", "").replace("http://", "");
    let split_level1 = url.split("/")[2];
    return {
        bms_id: split_level1.split("#")[0],
        bm_id: url.split("/")[3],
        mode: split_level1.split("#")[1]
    }
}

async function execute(args, message) {
    const {channel} = message;
    switch (args.length) {
        default: 
            if (args.length > 2) {
                return true;
            }
            channel.send(osuCmd.usage);
            return false;
        case 2:
            switch (args[0].toLowerCase()) {
                default:
                    channel.send(osuCmd.usage);
                    return false;
                case "player":
                case "p":
                case "user":
                case "u":
                    channel.send(await playerInfo(args[1]));
                    return true;
                case "beatmap":
                case "bm":

                    return true;
            }
        case 3: 
            switch (args[0].toLowerCase()) {
                default:
                    channel.send(osuCmd.usage);
                    return false;
                case "player":
                case "p":
                case "user":
                case "u":
                    channel.send(await playerInfo(args[1], args[2]));
                    return true;
                case "beatmap":
                case "bm":

                    return true;
            }
    }
}

async function playerInfo(player, mode=0) {
    let p = (await osu.player(player, mode));
    let description = [
        `**User**: ${p.username} (ID: ${p.id})`,
        `**Joined Osu!:** ${p.join_date}`,
        `**Accuracy: ** ${p.accuracy}%`,
        `**Level:** ${p.level}`,
        `**Total Play Time:** ${p.playtime}`,
        "",
        `**Ranked Score:** ${p.ranked_score}`,
        `**Total Score:** ${p.total_score}`,
        `**PP:** ${p.pp}`,
        `**Rank:** #${p.rank}`,
        `**Country rank:** #${p.country_rank}`,
        "",
        `**Play Count:** ${p.playcount}`,
        `**SS+ plays:** ${p.ssh}`,
        `**SS plays:** ${p.ss}`,
        `**S+ plays:** ${p.sh}`,
        `**S plays:** ${p.s}`,
        `**A plays:** ${p.a}`
    ].join("\n");
    let img = `http://lemmmy.pw/osusig/sig.php?colour=hexff66aa&uname=${p.username}&pp=2&mode=${p.mode_id}&countryrank&flagshadow&onlineindicator=undefined&xpbar&xpbarhex`;
    return new MessageEmbed()
        .setColor(0xff66aa)
        .setDescription(description)
        .setThumbnail(p.avatar)
        .setImage(img)
        .setAuthor(p.username, p.avatar, `https://osu.ppy.sh/users/${p.id}`)
        .setFooter(`Mode: ${p.mode_text}`)
}