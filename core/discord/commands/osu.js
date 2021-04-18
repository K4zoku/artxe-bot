const {src} = process.global;
const {join} = require("path");
const Command = require(join(src, "core", "command", "command"));
const {MessageAttachment, MessageEmbed} = require("discord.js");
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
            channel.send(`**Usage:** \`${osuCmd.usage}\``);
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
                    let pinfo = await playerInfo(args[1]);
                    channel.send(pinfo ? pinfo : "ERROR");
                    return !!pinfo;
                case "beatmap":
                case "bm":
                    let binfo = await beatmapInfo(args[1]);
                    channel.send(binfo ? binfo : "ERROR");
                    return !!binfo;
                case "mirror":
                case "m":
                    channel.send("Getting beatmap...");
                    let id = Number.isInteger(+args[1]) ? args[1] : osu.parseLink(args[1]).beatmapset_id;
                    let d = await osu.download(id);
                    if (d.status != 200) {
                        channel.send((await d.json()).message);
                        return false;
                    }
                    let size = (+d.headers.get("content-length"))/1048576; // to Mb
                    const pattern = /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i;
                    let name = d.headers.get("content-disposition").match(pattern)[1];
                    name = decodeURI(name);
                    channel.send(d.url);
                    size < 8 && channel.send("Attachment", new MessageAttachment(await d.buffer(), name));
                    return true;
            }
        case 3: 
            switch (args[0].toLowerCase()) {
                default:
                    channel.send(`**Usage:** \`${osuCmd.usage}\``);
                    return false;
                case "player":
                case "p":
                case "profile":
                case "user":
                case "u":
                    let pinfo = await playerInfo(args[1], args[2]);
                    channel.send(pinfo ? pinfo : "ERROR");
                    return !!pinfo;
                case "beatmap":
                case "bm":
                case "b":
                    let binfo = await beatmapInfo(args[1], args[2]);
                    channel.send(binfo ? binfo : "ERROR");
                    return !!binfo;
            }
    }
}

async function playerInfo(player, mode=0) {
    let p = (await osu.player(player, mode));
    if (!p) return null;
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

async function beatmapInfo(b, mode) {
    b = (await osu.beatmap(b, mode));
    if (!b) return null;
    let description = [
        `**Beatmap:** [Link](https://osu.ppy.sh/b/${b.beatmap_id})`,
        `**Title:** ${b.title}`,
        `**Origin Title:** ${b.source}`,
        `**Artist**: ${b.artist}`,
        `**Creator:** ${b.creator}`,
        `**BPM:** ${b.bpm}`,
        `**Approval Status:** ${b.status}`,
        `**User Rating:** ${b.rating}`,
        "",
        `**Version:** ${b.version}`,
        `**Circle size (CS): ** ${b.cs}`,
        `**Drain (HP):** ${b.hp}`,
        `**Overall (OD)**: ${b.od}`,
        `**Approach rate (AR):** ${b.ar}`,
        `**Star difficulty:** ${b.stars}⭐`
    ].join("\n");
    return new MessageEmbed()
        .setColor(0xff66aa)
        .setDescription(description)
        .setThumbnail(b.thumbnail)
        .setImage(b.cover)
        .setFooter(b.hash)
}

async function beatmapMirror(b) {

}