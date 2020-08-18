const sqlite3 = require('sqlite3');
const Logger = require('../terminal/Logger');
const request = require('request');

let db = new sqlite3.Database("./storage/ai.db", (err) => {
    if (err) {
        return console.log(err);
    }
    Logger.info("[Storage] Ready!");
});
module.exports = {
    reply(message) {
        request({
            url: "https://simsumi.herokuapp.com/api?lang=vi&text=" + encodeURI(message.content),
            json: false
        }, function(error, response, body) {
            let data = JSON.parse(body);
            let reply = data["success"];
            aidb(message.content, reply);
            reply = reply ? reply : "em hổng hiểu nghĩa cái này";
            message.channel.send(reply);
        });
    }
}

function aidb(pattern, response) {
    db.run(`create table if not exists aitb(id integer not null constraint aitb_pk primary key autoincrement, pattern text not null, response text default null)`, (err) => {
        if (err) {
            return Logger.error(err);
        }
    });
    db.run(`insert into aitb(pattern, response) VALUES ('${pattern}', '${response}')`, (err) => {
        if (err) {
            return Logger.error(err);
        }
        Logger.info(`<chat><pattern>${pattern}</pattern><reply>${response}</reply></chat>`);
    });
}