const fetch = require("node-fetch");
const {Api} = require("node-osu");
const {join} = require("path");
const {batchApply} = require(join(process.global.src, "core", "placeholder"));

const mirror = process.env.HEROKU_URL + "/download/{bmsid}?noVideo={n}";
let api = process.env.osu_api && new Api(process.env.osu_api);

module.exports = {
	download: async (bmsid, noVideo=true) => fetch(batchApply(mirror, {bmsid: +bmsid, n: noVideo ? 1 : 0})),
	api: api,
	player: player,
} 

const modeName = {
    0: "Osu!",
    1: "Osu!Taiko",
    2: "Osu!Catch",
    3: "Osu!Mania",
}

const modeMatch = {
    0: [0, "osu!", "osu!std", "std", ""],
    1: [1, "osu!taiko", "taiko"],
    2: [2, "osu!catch", "catch", "osu!ctb", "ctb", "catch-the-beat"],
    3: [3, "osu!mania", "mania"],
}
    
const f_int = (value) => parseInt(value).toLocaleString("en-US");

async function player(player, mode=0) {
    mode = Object.entries(modeMatch).find(e => !!e[1].find(v => v == mode));
    if (mode === undefined) mode = 0;
    else mode = mode[0];
    let modeText = modeName[mode];
    let ps = await api.apiCall("/get_user", {u: player, m: mode});

    if (!ps) return null;
    const p = ps[0];
    // Play time calculation
    let playTime = p.total_seconds_played;
    let d = ~~(playTime / (3600 * 24));
    let h = ~~(playTime % (3600 * 24) / 3600);
    let m = ~~(playTime % 3600 / 60);
    let hours = Math.round(playTime / 60 / 60);
    let avatar = `https://a.ppy.sh/${p.user_id}`;
    (await fetch(avatar)).status !== 200 && (avatar = "https://osu.ppy.sh/images/layout/avatar-guest.png");

    return {
        id: p.user_id,
        avatar: `https://a.ppy.sh/${p.user_id}`,
        username: p.username,
        join_date: p.join_date,
        accuracy: (+p.accuracy).toFixed(2),
        level: Math.round(p.level),
        playtime: `${d}d ${h}h ${m}m (${hours} hours)`,

        total_score: f_int(p.total_score),
        ranked_score: f_int(p.ranked_score),
        pp: Math.round(p.pp_raw).toLocaleString("en-US"),
        rank: f_int(p.pp_rank),
        country_rank: f_int(p.pp_country_rank),

        mode_id: mode,
        mode_text: modeText,
        playcount: f_int(p.playcount),
        ssh: f_int(p.count_rank_ssh),
        ss: f_int(p.count_rank_ss),
        sh: f_int(p.count_rank_sh),
        s: f_int(p.count_rank_s),
        a: f_int(p.count_rank_a),
    }        
}