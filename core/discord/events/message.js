const Event = require("../event");
const logger = process.global.logger;

module.exports = new Event("message", async (message) => {
	const content = message.content;
	
});