
class Writer {
    constructor(write = s => console.log(s)) {
        this.write = write;
    }
}

module.exports = Writer;