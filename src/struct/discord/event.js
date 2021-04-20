class Event {
	constructor(event, listener, mode="on") {
		this.event = event
		this.listener = listener; 
		this.mode = mode;
	}

	register(client) {
		switch (this.mode.toLowerCase()) {
			case "on":
			default:
				client.on(this.event, (param) => this.handleEvent(param));
				break;
			case "once":
				client.once(this.event, (param) => this.handleEvent(param));
				break;
		}
	}

	handleEvent(param) {
		this.listener(param);
	}
}

module.exports = Event;
