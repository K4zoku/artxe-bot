class Event {
	constructor(event, listener, mode="on") {
		this.event = event
		this.listener = listener;
		this.mode = mode;
		this.error = e => error(e, {label: "Discord/Event/" + event});
	}

	register(client) {
		switch (this.mode.toLowerCase()) {
			case "on":
			default:
				client.on(this.event, param => this.handleEvent(param).catch(this.error));
				break;
			case "once":
				client.once(this.event, param => this.handleEvent(param).catch(this.error));
				break;
		}
	}

	async handleEvent(param) {
		return this.listener(param);
	}
}

module.exports = Event;
