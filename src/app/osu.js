const {Api} = require("node-osu");
const {URL} = require("url");

let api = process.env.OSU_API_KEY &&
	new Api(process.env.OSU_API_KEY, {
		notFoundAsError: false,
		parseNumeric: true
	});
const mirror = process.env.HEROKU_URL + "osu/download/{id}?noVideo={n}";
module.exports = {
	download: async (id, noVideo=true) => fetch(placeholder(mirror, {id: +id, n: noVideo ? 1 : 0})),
	api: api,
	getMode: getMode,
	player: player,
	beatmap: beatmap,
	parseLink: parseLink,
} 

async function beatmap(idOrLink, mode) {
	mode = mode && getMode(mode);
	let id = Number.isInteger(+idOrLink) ? {beatmap_id: idOrLink} : parseLink(idOrLink);
	let opts = {};
	id.beatmap_id && (opts.b = id.beatmap_id);
	id.beatmapsets_id && (opts.s = id.beatmapsets_id);
	id.mode && (opts.m = mode ? mode : getMode(id.mode))
	let b = await api.getBeatmaps(opts);
	if (!b) return null;
	b = b[0];

	return {
		beatmap_id: b.id,
		beatmapset_id: b.beatmapSetId,
		hash: b.hash,
		title: b.title,
		source: b.source,
		artist: b.artist,
		creator: b.creator,
		bpm: b.bpm,
		status: b.approvalStatus,
		rating: (+b.rating).toFixed(2),
		version: b.version,
		cs: b.difficulty.size,
		od: b.difficulty.overall,
		ar: b.difficulty.approach,
		hp: b.difficulty.drain,
		stars: (+b.difficulty.rating).toFixed(2),
		cover: `https://assets.ppy.sh/beatmaps/${b.beatmapSetId}/covers/cover.jpg`,
		thumbnail: `https://b.ppy.sh/thumb/${b.beatmapSetId}l.jpg`
	}

}

function parseLink(url) {
	url = new URL(url.toLowerCase());
	if (url.host != "osu.ppy.sh") return;
	let [path, id] = url.pathname.substr(1).split("/");
	if (!id) return {};
	switch (path) {
		case "b":
			return {
				beatmap_id: id
			}
		case "users":
		case "u":
			return {
				user_id: id
			}
		case "beatmapsets":
			if (url.hash) {
				let [mode, bm_id] = url.hash.substr(1).split("/");
				return {
					beatmapset_id: id,
					beatmap_id: bm_id,
					mode: mode
				};
			}
		// noinspection FallThroughInSwitchStatementJS
		case "s":
			return {
				beatmapset_id: id
			};
		default:
			return null;
	}
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
    2: [2, "osu!catch", "catch", "osu!ctb", "ctb", "catch-the-beat", "osu!fruits", "osu!fruit", "fruits", "fruit"],
    3: [3, "osu!mania", "mania"],
}

function getMode(m) {
	m = (m+"").toLowerCase();
	let mode = Object.entries(modeMatch).find(e => !!e[1].find(v => v == m));
    return mode && mode[0];
}

const f_int = (value) => parseInt(value).toLocaleString("en-US");

async function player(player, mode=0) {
    mode = getMode(mode) ?? 0;
    let modeText = modeName[mode];
	mode = +mode;
    let p = await api.getUser({u: player, m: mode});

	if (!p || p.length == 0) return null;
	// Play time calculation
	let playTime = p.secondsPlayed;
	let d = ~~(playTime / (3600 * 24));
	let h = ~~(playTime % (3600 * 24) / 3600);
	let m = ~~(playTime % 3600 / 60);
	let hours = Math.round(playTime / 60 / 60);

	let avatar = `https://a.ppy.sh/${p.id}`;
	let {status} = await fetch(avatar);
	status !== 200 && (avatar = "https://osu.ppy.sh/images/layout/avatar-guest.png");
	return {
		id: p.id,
		avatar: avatar,
		username: p.name,
		join_date: p.raw_joinDate,
		accuracy: (+p.accuracy).toFixed(2),
		level: Math.round(p.level),
		playtime: `${d}d ${h}h ${m}m (${hours} hours)`,

		total_score: f_int(p.scores.total),
		ranked_score: f_int(p.scores.ranked),
		pp: Math.round(p.pp.raw).toLocaleString("en-US"),
		rank: f_int(p.pp.rank),
		country_rank: f_int(p.pp.countryRank),

        mode_id: mode,
        mode_text: modeText,
        playcount: f_int(p.counts.plays),
        ssh: f_int(p.counts.SSH),
        ss: f_int(p.counts.SS),
        sh: f_int(p.counts.SH),
        s: f_int(p.counts.S),
        a: f_int(p.counts.A),
    }        
}