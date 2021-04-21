const {V2} = require("osu-api-extended");
const {URL} = require("url");

let apiV2 = new V2(+process.env.OSU_CLIENT_ID, process.env.OSU_CLIENT_SECRET);
apiV2.login()
	.then(_ => _ && Logger.info( "Logged-in success", {label: "Osu!API/V2"} ))
	.catch(error);
module.exports = {
	apiV2,
	download,
	getModeId,
	getModeName,
	getUserAvatar,
	parseLink,
	getUser,
	setUser,
}

const mirror = process.env.HEROKU_URL + "osu/download/{id}?noVideo={n}";
async function download(id, n=true) {
	return fetch(placeholder(mirror, {id, n}))
}

async function getUserAvatar(id) {
	let avatarUrl = "https://a.ppy.sh/" + id;
	return fetch(avatarUrl, {method: "HEAD"})
		.then(res =>
			res.status === 200 ?
				avatarUrl :
				"https://osu.ppy.sh/images/layout/avatar-guest.png"
		);
}

const Mode = {
	0: "Osu!",
	1: "Osu!Taiko",
	2: "Osu!Catch",
	3: "Osu!Mania",
}

const ModeMatch = {
	0: /^$|^(0|std|osu(?:!(?:std)?)?)$/i,
	1: /^(1|((?:osu!)?taiko))$/i,
	2: /^(2|fruits?|c(?:atch(?:-the-beat)?|tb)|osu!(?:fruits?|c(?:atch(?:-the-beat)?|tb)))$/i,
	3: /^(3|((?:osu!)?mania))$/i,
}

function getModeId(rawMode) {
	if (!isNaN(rawMode) && (rawMode | 3-rawMode) >= 0) return +rawMode;
	rawMode = rawMode + "";
	let [mode] = Object.entries(ModeMatch).find(([,match]) => match.test(rawMode)) ?? [false];
	return mode;
}

function getModeName(m) {
	return ((!isNaN(m) && (m | 3-m) >= 0) && Mode[m]) ?? false;
}

/**
 * @param url osu link
 * 			+ https://osu.ppy.sh/b/{beatmap_id}
 * 			+ https://osu.ppy.sh/beatmaps/{beatmap_id}
 * 			+ https://osu.ppy.sh/s/{beatmapset_id}
 * 			+ https://osu.ppy.sh/beatmapsets/{beatmapset_id}?mode={mode}
 *			+ https://osu.ppy.sh/beatmapsets/{beatmapset_id}#{mode}/{beatmap_id}
 * 			+ https://osu.ppy.sh/u/{user_id}
 * 			+ https://osu.ppy.sh/users/{user_id}/{mode}
 * @returns {
 * 		boolean |
 * 		{beatmap_id: string} |
 * 		{beatmapset_id: string, beatmap_id: string, mode: number} |
 * 		{beatmapset_id: string} |
 * 		{beatmapset_id: string, mode: number} |
 * 		{user_id: string} |
 * 		{user_id: string, mode: number} |
 * }
 */
function parseLink(url) {
	url = new URL(url.toLowerCase());
	if (url.host !== "osu.ppy.sh") return false;
	let split = url.pathname.substr(1).split("/");
	let [path, id] = split;
	if (!id) return false;
	switch (path) {
		case "beatmaps":
		case "b":
			return {
				beatmap_id: id
			}
		case "users":
			if (split.length === 3) {
				let mode = getModeId(split.pop());
				return {
					user_id: id,
					mode
				}
			}
		// noinspection FallThroughInSwitchStatementJS
		case "u":
			return {
				user_id: id
			}
		case "beatmapsets":
			if (url.hash) {
				let [mode, beatmap_id] = url.hash.substr(1).split("/");
				mode = getModeId(mode);
				return {
					beatmapset_id: id,
					beatmap_id,
					mode
				};
			}
			if (url.search && url.searchParams.get("mode")) {
				let mode = getModeId(url.searchParams.get("mode"));
				return {
					beatmapset_id: id,
					mode
				};
			}
		// noinspection FallThroughInSwitchStatementJS
		case "s":
			return {
				beatmapset_id: id
			};
		default:
			return false;
	}
}

async function getUser(discordId) {
	await initTable();
	return pg.select("osu_id")
		.from("osu")
		.where({discord_id: discordId});
}

async function setUser(discord_id, osu_id) {
	await initTable();
	let rows = await pg.select("*").from("osu").where({discord_id}).length;
	return rows === 0 ?
		pg.insert({discord_id, osu_id}).into("osu") :
		pg.update({osu_id}).table("osu").where({discord_id});
}

async function initTable() {
	return pg.schema.hasTable("osu")
		.then(exists => !exists &&
			pg.schema.createTable("osu", table => {
				table.string("discord_id", 32);
				table.string("osu_id", 16);
				table.unique(["discord_id"], "discord_id");
			}) || exists
		);
}