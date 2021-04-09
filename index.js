console.log("Initializing...");
process.global = {};
process.global.src = __dirname;
require("./core/logger")().then(() => {
	require("./core/tty/autoload");
	require("./core/discord/autoload");
});