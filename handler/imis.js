const { Client } = require('pg'),
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
client.connect();

const Logger = require('../terminal/Logger');
const request = require('request');

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
    client.query(`create table if not exists aitb(id integer not null constraint aitb_pk primary key autoincrement, pattern text not null, response text default null)`, (err) => {
        if (err) {
            return Logger.error(err);
        }
    });
    client.query(`insert into aitb(pattern, response) VALUES ('${pattern}', '${response}')`, (err) => {
        if (err) {
            return Logger.error(err);
        }
        Logger.debug(`<chat><pattern>${pattern}</pattern><reply>${response}</reply></chat>`);
    });
}