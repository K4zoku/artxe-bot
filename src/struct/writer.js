
class Writer {
    #writeFn;
    constructor(write = (...s) => Logger.info(s)) {
        this.#writeFn = write;
    }

    write(content, data) {
        return this.#writeFn(content, data);
    }
}

module.exports = Writer;