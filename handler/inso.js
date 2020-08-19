const Discord = require('discord.js');
const request = require('request');
const requestImgSize = require('request-image-size');
const osu = require('node-osu');
const osuApi = new osu.Api("f542df9a0b7efc666ac0350446f954740a88faa8", {
    notFoundAsError: true,
    completeScores: false
});

const defaultAvatar = "https://osu.ppy.sh/images/layout/avatar-guest.png";

module.exports = {
    beatmap(bm, botMsg) {
        let channel = botMsg.channel;
        let oid = beatmapLinkExplode(bm);
        osuApi.getBeatmaps({b: oid.bm_id})
            .then(m => {
                let Title = m[0].title;
                let OriginTitle = m[0].source !== "" ? m[0].source : Title;
                let Artist = m[0].artist;
                let Creator = m[0].creator;
                let BPM = m[0].bpm;
                let Status = m[0].approvalStatus;
                let Rating = parseFloat(m[0].rating).toFixed(2);
                let Version = m[0].version;
                let Size = m[0].difficulty.size;
                let Drain = m[0].difficulty.drain;
                let Overall = m[0].difficulty.overall;
                let Approach = m[0].difficulty.approach;
                let Star = parseFloat(m[0].difficulty.rating).toFixed(2);

                let embed = {
                    "description": `**Beatmap:** https://osu.ppy.sh/b/${oid.bm_id} \n **Title:** ${Title} \n **Origin Title:** ${OriginTitle} \n **Artist**: ${Artist}\n **Creator:** ${Creator} \n **BPM:** ${BPM} \n **Approval Status:** ${Status} \n **User Rating:** ${Rating} \n\n **Version:** ${Version} \n **Circle size: ** ${Size} \n **HP Drain:** ${Drain} \n **Accuracy**: ${Overall} \n **Approach rate:** ${Approach} \n **Star difficulty:** ${Star}⭐`,
                    "color": 15822505,
                    "footer": {
                        "text": "Beatmap mirror download"
                    }
                };

                let mirrorBMLink = 'https://bot.levelhigh.site/osu_bm/' + oid.bms_id;
                botMsg.edit("**Complete** ヾ(≧▽≦*)o", {embed: embed});
                request({
                    url: mirrorBMLink,
                    json: false,
                    timeoutSeconds: 120
                }, (error, response, body) =>  {
                    let data = JSON.parse(body);
                    let size = parseInt(data.size);
                    if (size < 8000) {
                        channel.send(data.url).then(() => {
                            channel.send(new Discord.MessageAttachment(data.url)).then();
                        });
                    } else {
                        channel.send(data.url);
                    }
                });
            });
    },

    playerInfo(player, mode, channel) {
        let modeText = "Osu!";
        switch (mode) {
            case 1:
                modeText += "Taiko";
                break;
            case 2:
                modeText += "Catch";
                break;
            case 3:
                modeText += "Mania";
                break;
            case 0:
            default:
                break;
        }
        osuApi.apiCall("/get_user", {u: player, m: mode}).then( p => {
            let uid = p[0]["user_id"];
            let Name = p[0]["username"];
            let JoinDate = p[0]["join_date"];
            let Accuracy = parseFloat(p[0]["accuracy"]).toFixed(2);
            let Level = Math.round(p[0]["level"]);

            // Play time calculation
            let total_seconds_played = p[0]["total_seconds_played"];
            let d = ~~(total_seconds_played / (3600 * 24));
            let h = ~~(total_seconds_played % (3600 * 24) / 3600);
            let m = ~~(total_seconds_played % 3600 / 60);
            let hour = Math.round(total_seconds_played * 0.000277777778);
            let PlayTime = `${d}d ${h}h ${m}m (${hour} hours)`;

            let RankedScore = numberWithCommas(parseInt(p[0]["ranked_score"]));
            let TotalScore = numberWithCommas(parseInt(p[0]["total_score"]));
            let PP = Math.round(p[0]["pp_raw"]);
            let Rank = numberWithCommas(parseInt(p[0]["pp_rank"]));
            let CountryRank = numberWithCommas(parseInt(p[0]["pp_country_rank"]));
            let PlayCount = numberWithCommas(parseInt(p[0]["playcount"]));
            let SSH = numberWithCommas(parseInt(p[0]["count_rank_ssh"]));
            let SS = numberWithCommas(parseInt(p[0]["count_rank_ss"]));
            let SH = numberWithCommas(parseInt(p[0]["count_rank_sh"]));
            let S = numberWithCommas(parseInt(p[0]["count_rank_s"]));
            let A = numberWithCommas(parseInt(p[0]["count_rank_a"]));
            let avatarUrl = `http://a.ppy.sh/${uid}`;
            let setAvt = function (url) {
                avatarUrl = url;
                return url;
            }
            try {
                requestImgSize(avatarUrl).catch(async () => {
                    avatarUrl = setAvt(defaultAvatar);
                });
            } catch (e) {
                avatarUrl = defaultAvatar;
            }
            let embed = {
                "color": 0xf16ea9,
                "description": `**User**: ${Name} (ID: ${uid}) \n **Joined Osu!:** ${JoinDate} \n **Accuracy: ** ${Accuracy}% \n **Level:** ${Level} \n **Total Play Time:** ${PlayTime} \n\n **Ranked Score:** ${RankedScore} \n **Total Score:** ${TotalScore} \n **PP:** ${PP} \n **Rank:** #${Rank} \n **Country rank:** #${CountryRank} \n\n **Play Count:** ${PlayCount} \n **SS+ plays:** ${SSH} \n **SS plays:** ${SS} \n **S+ plays:** ${SH} \n **S plays:** ${S} \n **A plays:** ${A}`,
                "footer": {
                    "text": `Mode: ${modeText}`
                },
                "thumbnail": {
                    "url": avatarUrl
                },
                "image": {
                    "url": `http://lemmmy.pw/osusig/sig.php?colour=hexff66aa&uname=${Name}&pp=2&mode=${mode}&countryrank&flagshadow&onlineindicator=undefined&xpbar&xpbarhex`
                },
                "author": {
                    "name": `${Name}`,
                    "url": `https://osu.ppy.sh/users/${uid}`,
                    "icon_url": avatarUrl
                }
            };
            channel.send({embed: embed});
        });
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function beatmapLinkExplode(url) {
    url = url.replace("https://", "").replace("http://", "");
    let split_level1 = url.split("/")[2];
    return {
        bms_id: split_level1.split("#")[0],
        bm_id: url.split("/")[3],
        mode: split_level1.split("#")[1]
    }
}