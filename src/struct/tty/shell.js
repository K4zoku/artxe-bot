const readline = require("readline");
const colors = require("../../tty/colors");
const {prompt_char} = require("../../../configuration/tty.json");

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

    ask(question, onAnswered) {
        this.commandManager.write(question);
        this.asking = true;
        this.onAnswered = onAnswered;
    }

    async asyncAsk(question) {
        return await new Promise(resolve => this.ask(question, answer => resolve(answer))) 
    }

    handle(input) {
        if (!input) return false;
        if (!this.asking) return this.commandManager.execute(input);
        this.asking = false;
        this.onAnswered(input);
        return true;
    }
}

module.exports = Shell;