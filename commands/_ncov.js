const BotCommand = require('./BotCommand');
const ivoc = require("../handler/ivoc");
const {fallback} = require("../handler/utils");

module.exports = new BotCommand(
    "ncov",
    ["covid", "covid-19", "corona"],
    "View summary info of SARS-Cov-2",
    "ncov [{CountryName}]",
    undefined,
    async (commandLabel, commandArgs, message) => {
        const country = fallback(commandArgs.join(" "), "global");
        await ivoc.getData(country, message);
    },
    0,
    false,
    true,
    [],
    true,
    false
);

