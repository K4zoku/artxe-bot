const BotCommand = require('./BotCommand');
const inso = require("../handler/inso");

module.exports = new BotCommand(
    "osu",
    [""],
    "View Osu info",
    "osu [player|beatmap] [link|name]",
    undefined,

    async (commandLabel, commandArgs, message, member, channel) => {
        switch (commandArgs.length) {
            case 2:
                switch (commandArgs[0].toLowerCase()) {
                    case "player":
                        await inso.playerInfo(commandArgs[1], 0, channel);
                        return;
                    case "beatmap":
                        await channel.send("**Wait a bit ＞︿＜**").then(sent => {
                            inso.beatmap(commandArgs[1], sent);
                        });
                        return;
                    default:
                        return;
                }
            case 3:
                switch (commandArgs[0].toLowerCase()) {
                    case "player":
                        let m;
                        switch (commandArgs[2].toLowerCase()) {
                            default:
                            case "osu":
                            case "osu!":
                            case "0":
                                m = 0;
                                break;
                            case "taiko":
                            case "osu!taiko":
                            case "1":
                                m = 1;
                                break;
                            case "catch":
                            case "osu!catch":
                            case "ctb":
                            case "osu!ctb":
                            case "2":
                                m = 2;
                                break;
                            case "mania":
                            case "osu!mania":
                                m = 3;
                                break;
                        }
                        await inso.playerInfo(commandArgs[1], m, channel);
                        return;
                    default:
                        return;
                }
            default:
                return;
        }

    },
    0,
    false,
    false,
    [],
    true,
    false
);
