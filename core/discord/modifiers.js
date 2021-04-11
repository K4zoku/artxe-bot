const ONLY_OWNER = 0x8;
const ALLOW_BOT  = 0x4;
const ALLOW_DM   = 0x2;
const ONLY_NSFW  = 0x1;

module.exports = {
	remMod: (m, mod) => m ^ mod,
	addMod: (m, mod) => m | mod,
	hasMod: (m, mod) => !!(m & mod),
	mods: {
		ONLY_OWNER: ONLY_OWNER,
		ALLOW_BOT: ALLOW_BOT,
		ALLOW_DM: ALLOW_DM,
		ONLY_NSFW: ONLY_NSFW,
	}
};