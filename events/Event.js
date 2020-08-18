class Event {
    constructor(type="on", name="", execute=()=>{}) {
        this.type = type;
        this.name = name;
        this.execute = execute;
    }
}

module.exports = Event;