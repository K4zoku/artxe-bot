module.exports = {
    fallback: (...params) => {
        for (const param of params) {
            if (param !== undefined) {
                return param;
            }
        }
    },

    isset: (variable) => {
        return variable !== undefined;
    },

    login: () => {
        const Logger = require("../terminal/Logger");
        process["internal"]["discord"]["client"].login(process["internal"]["discord"]["bot"]["token"])
            .then(() => {
                Logger.info(`[DiscordClient] Logged in as ${process["internal"]["discord"]["client"].user.tag}`)
                process["internal"]["discord"]["bot"]["logged-in"] = true;
            })
            .catch(Logger.error);
    }
}