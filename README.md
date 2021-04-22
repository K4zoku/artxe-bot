# artxe-bot

artxe-bot is a NodeJS project working on the discord bot, built up from Discord.js.

## Installation

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/takahatashun/artxe-bot)

## Manual Installation

### Clone

Use git to clone this project

```bash
git clone https://github.com/takahatashun/artxe-bot.git
```

### Install dependencies

Use the package manager [npm](https://www.npmjs.com) to install dependencies.

```bash
npm install
```

### Configuration

* Go through the [configuration](configuration) before running the bot
* Add some required environments (env)

```env
DISCORD_TOKEN        Discord token - get from https://discord.com/developers/
HEROKU_URL           Heroku App URL - Can be replaced with https://127.0.0.1:42783/ which is local test URL
OSU_CLIENT_ID        Osu OAuth ID - See https://osu.ppy.sh/docs/index.html#registering-an-oauth-application
OSU_CLIENT_SECRET    Osu OAuth Secret - See above ^ 
ZALO_API_KEY         Zalo AI API key - Get from https://zalo.ai, this is required for nine-line detector
```

### Run

```bash
node index
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[Apache 2.0](LICENSE)