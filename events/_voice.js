const Logger = require('../terminal/Logger');
const EventInterface = require('./Event');

module.exports = new EventInterface("on", "voiceStateUpdate", async (...args) => {
        const oldState = args[0][0];
        const newState = args[0][1];
});
