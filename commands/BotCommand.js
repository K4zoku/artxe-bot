const Discord = require('discord.js');
class BotCommand {
    name;

    constructor(name="", alias=[""], desc="", example="", related="", execute=(commandLabel="", commandArgs=[""], message=new Discord.Message(), member=new Discord.GuildMember(), channel=new Discord.Channel())=>{}, cooldown=0, owner=false, bot=false, permissions=[""], dm=true, nsfw=false) {
        this.name = name;
        this.alias = alias;
        this.desc = desc;
        this.example = example;
        this.related = related;
        this.execute = execute;
        this.cooldown = cooldown;
        this.owner = owner;
        this.bot = bot;
        this.permissions = permissions;
        this.dm = dm;
        this.nsfw = nsfw;
    }

}

module.exports = BotCommand;