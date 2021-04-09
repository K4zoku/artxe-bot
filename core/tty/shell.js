const readline = require("readline");
const colors = require("./colors");
const {prompt_char} = require("../../configuration/tty.json");

class Shell {
    /**
     *
     * @param commandManager {CommandManager}
     * @param readStream
     * @param writeStream
     */
    constructor(commandManager, readStream=process.stdin, writeStream=process.stdout) {
        this.commandManager = commandManager;
        this.rl = readline.createInterface(readStream, writeStream);
    }

    async listen() {
        this.prompt();
        this.rl.on("line", line => this.prompt(this.handle(line)));
    }

    prompt(success = true) {
        let color = success ? colors.fg.blue : colors.fg.red;
        this.rl.setPrompt(`${color}${prompt_char}${colors.misc.reset} `);
        this.rl.prompt();
    }

    ask(question, callback) {
        this.commandManager.getWriter().write(question);
        this.asking = true;
        this.askCallback = callback;
    }

    handle(input) {
        if (this.asking) {
            this.asking = false;
            this.askCallback(input);
            return true;
        }
        if (input === "") return true;
        return this.commandManager.execute(input);
    }
}

module.exports = Shell;