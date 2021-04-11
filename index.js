(async () => {
	console.log("Initializing...");
	process.global = {
		// root directory
		src: __dirname,
		// load config
		config: {
			discord: require("./configuration/discord.json"),
			logger: require("./configuration/logger.json"),
			tty: require("./configuration/tty.json")
		}
	};
})()
.then(() => require("./core/logger")()) // init logger
.catch(console.error) // display error and stop when init logger failed
.then(() => require("./core/tty/autoload")()) // load tty
.then(() => require("./core/discord/autoload")()) // load discord
.catch(error => process.global.logger.error(error.stack));