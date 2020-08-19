const ConsoleCommand = require('./TerminalCommand');
const {login} = require("../../handler/utils");

module.exports = new ConsoleCommand(
    "token",
    ["login"],
    "Input bot token when no token found",
    "token {BotToken}",
    (args) => {
        if (!process["internal"]["discord"]["bot"]["logged-in"]) {
            process["internal"]["discord"]["bot"]["token"] = args[0];
            login();
        }
    }
)