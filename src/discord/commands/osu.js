const {MessageAttachment, MessageEmbed} = require("discord.js");
const osu = __("app/osu");

const MESSAGES = {
    ERROR: "```diff\n- ERROR: An error occurred\n```"
}
const osuCmd = new Command({
    label: "osu",
    aliases: ["oxu", "o"],
    description: "Osu!Command",
    usage: "osu <user|beatmap|mirror>",
    execute: execute,
    data: {
        modifier: 0x6,
        permissions: []
    }
});

module.exports = osuCmd;

async function execute(args, message) {
    const {channel} = message;
    switch (args.length) {
        case 0:
            await channel.send(`**Usage:** \`${osuCmd.usage}\``);
            return false;
        case 1:
            switch (args.shift().toLowerCase()) {
                case "profile":
                case "player":
                case "p":
                case "user":
                case "u":
                    await channel.send("**Usage:** `osu user <name> [--mode <mode>]`");
                    return false;
                case "beatmap":
                case "bm":
                case "b":
                    await channel.send("**Usage:** `osu beatmap <id or link> [mode]`");
                    return false;
                case "mirror":
                case "m":
                    await channel.send("**Usage:** `osu mirror <id or link>`");
                    return false;
                default:
                    return false;
            }
        case 2:
            switch (args.shift().toLowerCase()) {
                default:
                    channel.send(`**Usage:** \`${osuCmd.usage}\``);
                    return false;
                case "player":
                case "p":
                case "profile":
                case "user":
                case "u":
                    let pinfo = await playerInfo(args[0]);
                    await channel.send(pinfo);
                    return !!pinfo;
                case "beatmap":
                case "bm":
                case "b":
                    let binfo = await beatmapInfo(args[0]);
                    await channel.send(binfo);
                    return !!binfo;
                case "mirror":
                case "m":
                    channel.send("Getting beatmap...");
                    let id = Number.isInteger(+args[0]) ? args[0] : osu.parseLink(args[0]).beatmapset_id;
                    let d = await osu.download(id);
                    if (d.status != 200) {
                        channel.send((await d.json()).message);
                        return false;
                    }
                    channel.send(d.url);
                    let size = (+d.headers.get("content-length")) / 1048576; // to Mb
                    if (size > 8) return true;
                    const pattern = /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i;
                    let name = d.headers.get("content-disposition").match(pattern)[1];
                    name = decodeURI(name);
                    channel.send("Attachment", new MessageAttachment(await d.buffer(), name));
                    return true;
            }
        default:
            switch (args.shift().toLowerCase()) {
                case "profile":
                case "player":
                case "p":
                case "user":
                case "u":
                    let mode = 0;
                    let pname;
                    for (let i = 0; i < args.length; i++) {
                        if (args[i] === "--mode" || args[i] === "-m") {
                            pname = args.slice(0, i).join(" ");
                            console.log(pname);
                            mode = args.slice(i + 1).join(" ");
                            break;
                        }
                    }
                    let pinfo = await playerInfo(pname, mode);
                    await channel.send(pinfo);
                    return !!pinfo;
                case "beatmap":
                case "bm":
                case "b":
                    if (args.length !== 2) return false;
                    let binfo = await beatmapInfo(args[0], args[1]);
                    await channel.send(binfo);
                    return !!binfo;
                default:
                    await channel.send(`**Usage:** \`${osuCmd.usage}\``);
                    return false;
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
    let img = `https://lemmmy.pw/osusig/sig.php?colour=hexff66aa&uname=${encodeURI(p.username)}&pp=2&mode=${p.mode_id}&countryrank&flagshadow&onlineindicator=undefined&xpbar&xpbarhex`;
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
        `**Beatmap:** https://osu.ppy.sh/b/${b.beatmap_id}`,
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