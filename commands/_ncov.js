const BotCommand = require('./BotCommand');
const ivoc = require("../handler/ivoc");

module.exports = new BotCommand(
    "ncov",
    ["covid", "covid-19", "corona"],
    "View summary info of SARS-Cov-2",
    "ncov [{CountryName}]",
    undefined,
    async (commandLabel, commandArgs, message) => {
        const country = commandArgs.length === 0 ? "global" : commandArgs.join(" ");
        await ivoc.getData(country, message);
    },
    0,
    false,
    true,
    [],
    true,
    false
);

