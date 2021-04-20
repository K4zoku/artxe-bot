const {MessageAttachment, MessageEmbed} = require("discord.js");
const osu = __("app/osu");

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
                    await channel.send(`**Usage:** \`${osuCmd.usage}\``);
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
                    await channel.send("Getting beatmap...");
                    let id = Number.isInteger(+args[0]) ? args[0] : osu.parseLink(args[0]).beatmapset_id;
                    let d = await osu.download(id);
                    if (d.status != 200) {
                        await channel.send((await d.json()).message);
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
const formatPlayTime = playTime => {
    let d = Math.floor(playTime / (3600 * 24));
    let h = Math.floor(playTime % (3600 * 24) / 3600);
    let m = Math.floor(playTime % 3600 / 60);
    let hours = Math.round(playTime / 3600);
    return `${d}d ${h}h ${m}m (${hours} hours)`;
}

Number.prototype.pad = (_=2) => this.toString.padStart(_, "0")
const formatJoinDate = joinDate => {
    let date = new Date(joinDate);
    return `${date.getUTCFullYear()}-${(date.getUTCMonth()+1).pad()}-${date.getUTCDate().pad()} ${date.getUTCHours().pad()}:${date.getUTCMinutes().pad()}:${date.getUTCSeconds().pad()}`
}

async function playerInfo(player, mode=0) {
    if ((player + "").indexOf("osu.ppy.sh") !== -1) {
        player = osu.parseLink(player).user_id;
    }
    if (!player) return false;
    mode = osu.getModeId(mode);
    let p;
    try {
        p = await osu.apiV2.user(player, mode);
    } catch (e) {
        Logger.error(e, {label: "Discord"});
        return false;
    }

    let description = [
        `**User**: ${p.username} (ID: ${p.id})`,
        `**Joined Osu!:** ${formatJoinDate(p.join_date)}`,
        `**Accuracy: ** ${p.statistics.hit_accuracy.toFixed(2)}%`,
        `**Level:** ${p.statistics.level.current}`,
        `**Total Play Time:** ${formatPlayTime(p.statistics.play_time)}`,
        "",
        `**Ranked Score:** ${p.statistics.ranked_score.toLocaleString("en-US")}`,
        `**Total Score:** ${p.statistics.total_score.toLocaleString("en-US")}`,
        `**PP:** ${Math.floor(p.statistics.pp).toLocaleString("en-US")}`,
        `**Rank:** #${p.statistics.global_rank.toLocaleString("en-US")}`,
        `**Country rank:** #${p.statistics.rank.country.toLocaleString("en-US")}`,
        "",
        `**Play Count:** ${p.statistics.play_count.toLocaleString("en-US")}`,
        `**SS+ plays:** ${p.statistics.grade_counts.ssh.toLocaleString("en-US")}`,
        `**SS plays:** ${p.statistics.grade_counts.ss.toLocaleString("en-US")}`,
        `**S+ plays:** ${p.statistics.grade_counts.sh.toLocaleString("en-US")}`,
        `**S plays:** ${p.statistics.grade_counts.s.toLocaleString("en-US")}`,
        `**A plays:** ${p.statistics.grade_counts.a.toLocaleString("en-US")}`
    ].join("\n");
    let avatar = await osu.getUserAvatar(p.id);
    let img = `https://lemmmy.pw/osusig/sig.php?colour=hexff66aa&uname=${encodeURI(p.username)}&pp=2&mode=${mode}&countryrank&flagshadow&onlineindicator=undefined&xpbar&xpbarhex`;
    img = await fetch(img).then(_ => _.buffer());
    let name = p.id + ".png";
    img = new MessageAttachment(img, name);
    return new MessageEmbed()
        .attachFiles([img])
        .setColor(0xff66aa)
        .setDescription(description)
        .setThumbnail(avatar)
        .setImage("attachment://" + name)
        .setAuthor(p.username, avatar, `https://osu.ppy.sh/users/${p.id}`)
        .setFooter(`Mode: ${osu.getModeName(mode)}`)
}

async function beatmapInfo(b) {
    if ((b + "").indexOf("osu.ppy.sh") !== -1) {
        b = osu.parseLink(b).beatmap_id;
    }
    if (!b) return false;
    b = await osu.apiV2.beatmap(b);
    let s = b.beatmapset;

    let description = [
        `**Beatmap:** ${b.url}`,
        `**Title:** ${s.title}`,
        `**Origin Title:** ${s.source}`,
        `**Artist**: ${s.artist}`,
        `**Creator:** ${s.creator}`,
        `**BPM:** ${s.bpm}`,
        `**Status:** ${s.status}`,
        "",
        `**Version:** ${b.version}`,
        `**Circle size (CS): ** ${b.cs.toFixed(1)}`,
        `**Drain (HP):** ${b.drain.toFixed(1)}`,
        `**Overall (OD)**: ${b.accuracy.toFixed(1)}`,
        `**Approach rate (AR):** ${b.ar.toFixed(1)}`,
        `**Star difficulty:** ${b.difficulty_rating.toFixed(2)} ⭐`
    ].join("\n");
    return new MessageEmbed()
        .setColor(0xff66aa)
        .setDescription(description)
        .setThumbnail(s.covers.list)
        .setImage(s.covers.cover)
}