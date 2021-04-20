class Router {
    #matcher;
    #handler;

    constructor(match, handler) {
        this.#matcher = match;
        this.#handler = handler;
    }

    get matcher() {
        return this.#matcher;
    }

    async handle(request, response) {
        return this.#handler(request, response);
    }
}

module.exports = Router;